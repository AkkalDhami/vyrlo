/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Global, Module } from '@nestjs/common';

import { LRUCache } from 'lru-cache';

export const LRU_CACHE = 'LRU_CACHE';

export interface CacheInterface {
  userId: string;
  publicId: string;
  lastUsed: string;
}

@Global()
@Module({
  providers: [
    {
      provide: LRU_CACHE,
      useFactory: (): LRUCache<string, CacheInterface> =>
        new LRUCache<string, CacheInterface>({
          max: 10000,
          ttl: 5 * 60 * 1000,
          updateAgeOnGet: true,
          updateAgeOnHas: false,
          allowStale: false,
        }),
    },
  ],
  exports: [LRU_CACHE],
})
export class CacheModule {}
