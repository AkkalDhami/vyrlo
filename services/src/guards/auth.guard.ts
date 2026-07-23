/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  LAST_USED_DEBOUNCE_SECONDS,
  LAST_USED_HASH,
  LRU_SOFT_TTL_MS,
  REDIS_HARD_TTL_SECONDS,
  VERSION,
} from '@/constants';
import { apiKeys } from '@/database';
import { DRIZZLE_DB } from '@/database/database.module';
import { REDIS_CLIENT } from '@/infra/redis.module';
import { CachedKeyType } from '@/types';
import { digest, verifyHashedKey } from '@/utils/api-key-digest';
import { extractKeyId } from '@/utils/api-key-verifier';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';

import { verifyToken } from '@clerk/backend';

const lruCache = new LRUCache<string, CachedKeyType>({ max: 1000 });

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(DRIZZLE_DB)
    private readonly db: NeonDatabase<{
      apiKeys: typeof apiKeys;
    }>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-api-key'] as string | undefined;

    if (key) {
      const keyId = extractKeyId(key);

      if (!keyId) {
        throw new UnauthorizedException('Invalid API key');
      }

      const d = await digest(key);

      const [result] = await this.db
        .select({ value: apiKeys.value })
        .from(apiKeys)
        .where(eq(apiKeys.id, keyId));

      if (!result) {
        throw new UnauthorizedException('Invalid API key');
      }

      if (result.value !== d) {
        throw new UnauthorizedException('Invalid API key');
      }
      const lruKey = `${VERSION}:${keyId}` as const;
      const now = Date.now();

      try {
        const cached = lruCache.get(lruKey);

        if (cached && cached.expiresAt > now && cached.apiKeyDigest === d) {
          request.user = {
            id: cached.userId,
            keyId,
          };

          void this.trackApiKeyLastUsed(keyId);

          return true;
        }

        const rKeyDigest = `vyrlo:api_key:${VERSION}:${keyId}` as const;
        const rDigest = await this.redis.hgetall(rKeyDigest);

        if (rDigest?.invalid === '1') {
          throw new UnauthorizedException('Unauthorized!');
        }

        if (rDigest?.apiKeyDigest && rDigest?.apiKeyDigest !== d) {
          throw new UnauthorizedException('Unauthorized!');
        }

        if (rDigest?.userId) {
          lruCache.set(lruKey, {
            apiKeyDigest: d,
            userId: rDigest.userId,
            expiresAt: now + LRU_SOFT_TTL_MS,
          });

          request.user = {
            id: rDigest.userId,
            keyId,
          };

          void this.trackApiKeyLastUsed(keyId);

          return true;
        }

        const record = await this.db.query.apiKeys.findFirst({
          where: (ak) => and(eq(ak.id, keyId), isNull(ak.revokedAt)),
          columns: {
            userId: true,
            value: true,
            revokedAt: true,
          },
        });

        if (!record) {
          throw new UnauthorizedException('Unauthorized!');
        }

        // if (record.revokedAt) {
        //   throw new UnauthorizedException('Unauthorized!');
        // }

        const isValid = await verifyHashedKey(record.value, key);

        if (!isValid) {
          await this.redis.hset(rKeyDigest, {
            invalid: '1',
          });

          await this.redis.expire(rKeyDigest, REDIS_HARD_TTL_SECONDS);

          throw new UnauthorizedException('Unauthorized!');
        }

        await this.redis.hset(rKeyDigest, {
          apiKeyDigest: d,
          userId: record.userId,
        });

        await this.redis.expire(rKeyDigest, REDIS_HARD_TTL_SECONDS);

        request.user = {
          id: record.userId,
          keyId,
        };

        void this.trackApiKeyLastUsed(keyId);

        return true;
      } catch (error) {
        Logger.error({ authError: error });
        throw new UnauthorizedException('Unauthorized!');
      }
    }

    const tokenHeader = request.headers['authorization'] as string;

    const token = tokenHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Missing authorization token!');
    }

    try {
      const verifiedToken = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      if (!verifiedToken) {
        throw new UnauthorizedException('Unauthorized!');
      }

      request.user = {
        id: verifiedToken.sub,
        ...verifiedToken,
      };

      return true;
    } catch (error) {
      Logger.error({ authError: error });
      throw new UnauthorizedException(
        'Something went wrong! Please use our SDK.',
      );
    }
  }

  private async trackApiKeyLastUsed(keyId: string) {
    const lockKey = `vyrlo:api_key:last_used_lock:${VERSION}:${keyId}` as const;

    // const ok = this.redis.multi().set(lockKey, '1').expire(lockKey, 60).exec();
    const ok = await this.redis.set(
      lockKey,
      '1',
      'EX',
      LAST_USED_DEBOUNCE_SECONDS,
      'NX',
    );

    if (!ok) return;

    await this.redis.hset(LAST_USED_HASH, keyId, Date.now().toString());
  }
}
