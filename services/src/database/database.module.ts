import { neonConfig, Pool } from '@neondatabase/serverless';
import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './index';
import ws from 'ws';

export const DRIZZLE_DB = 'DRIZZLE_DB';

neonConfig.webSocketConstructor = ws;

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_DB,
      useFactory: () => {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
          throw new Error('DATABASE_URL is not defined');
        }

        const pool = new Pool({
          connectionString,
        });

        return drizzle(pool, {
          schema,
          // logger: process.env.NODE_ENV === 'development',
        });
      },
    },
  ],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule {}
