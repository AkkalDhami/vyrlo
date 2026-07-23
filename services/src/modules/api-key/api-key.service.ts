import { DRIZZLE_DB } from '@/database/database.module';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { apiKeys } from '@/database';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@/infra/redis.module';
import { and, count, eq } from 'drizzle-orm';

import crypto from 'node:crypto';
import argon2 from 'argon2';
import { LAST_USED_HASH, VERSION } from '@/constants';
import { LRUCache } from 'lru-cache';
import { CachedKeyType } from '@/types';

const localCache = new LRUCache<string, CachedKeyType>({ max: 1000 });

@Injectable()
export class ApiKeyService {
  constructor(
    @Inject(DRIZZLE_DB)
    private readonly db: NeonDatabase<{
      apiKeys: typeof apiKeys;
    }>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  generateKey(): { plaintextKey: string; keyId: string } {
    const keyId = crypto.randomUUID().replace(/-/g, '');
    const secret = crypto.randomBytes(32).toString('base64url');
    const plaintextKey = `vyrlo_${keyId}_${secret}`;

    return {
      plaintextKey,
      keyId,
    };
  }

  async createApiKey(userId: string) {
    const [result] = await this.db
      .select({ count: count() })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));

    if (!result) {
      throw new NotFoundException('User does not exist');
    }

    if (result.count >= 5) {
      throw new BadRequestException(
        'You have reached the maximum limit of 5 API keys.',
      );
    }

    const { plaintextKey, keyId } = this.generateKey();
    const hash = await argon2.hash(plaintextKey, {
      type: argon2.argon2id,
      timeCost: 3,
      memoryCost: 1 << 16,
      parallelism: 1,
    });

    const prefix = plaintextKey.substring(0, 18) + '...';

    await this.db.insert(apiKeys).values({
      id: keyId,
      userId,
      prefix,
      value: hash,
    });

    return {
      key: plaintextKey,
    };
  }

  async listApiKeys(userId: string) {
    return this.db
      .select({
        id: apiKeys.id,
        prefix: apiKeys.prefix,
        createdAt: apiKeys.createdAt,
        lastUsedAt: apiKeys.lastUsedAt,
        revokedAt: apiKeys.revokedAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));
  }

  async deleteApiKey(userId: string, keyId: string) {
    if (!keyId) {
      throw new BadRequestException('Missing keyId');
    }

    const [isAlreadyRevoked] = await this.db
      .select({
        revokedAt: apiKeys.revokedAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.id, keyId));

    if (!isAlreadyRevoked) {
      throw new NotFoundException('API key not found');
    }

    if (isAlreadyRevoked.revokedAt) {
      throw new BadRequestException('API key already revoked');
    }

    await this.db
      .update(apiKeys)
      .set({
        revokedAt: new Date(),
      })
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.id, keyId)));

    await this.redis.del(`vyrlo:api_key:${VERSION}:${keyId}`);

    localCache.delete(`${VERSION}:${keyId}`);
  }

  async regenerateApiKey(userId: string, keyId: string) {
    const { plaintextKey, keyId: newKeyId } = this.generateKey();
    const hash = await argon2.hash(plaintextKey, {
      type: argon2.argon2id,
      timeCost: 3,
      memoryCost: 1 << 16,
      parallelism: 1,
    });

    const prefix = plaintextKey.substring(0, 18) + '...';

    await this.db
      .update(apiKeys)
      .set({
        id: newKeyId,
        prefix,
        value: hash,
        lastUsedAt: new Date(),
      })
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));

    await this.redis.del(`vyrlo:api_key:${VERSION}:${keyId}`);

    localCache.delete(`${VERSION}:${keyId}`);

    return {
      key: plaintextKey,
    };
  }

  async getApiKeyLastUsed(keyId: string) {
    const normalizedKey = keyId.replace(/-/g, '');

    const redisValue = await this.redis.hget(LAST_USED_HASH, normalizedKey);

    if (redisValue) {
      return {
        lastUsedAt: new Date(Number(redisValue)),
      };
    }

    const record = await this.db.query.apiKeys.findFirst({
      where: (ak) => eq(ak.id, keyId),
      columns: {
        lastUsedAt: true,
      },
    });

    if (!record) {
      return null;
    }

    return {
      lastUsedAt: record.lastUsedAt,
    };
  }
}
