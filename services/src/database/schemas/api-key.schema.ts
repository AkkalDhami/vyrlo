import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { timestamps } from './schema.helper';

export const apiKeys = pgTable('api_keys', {
  id: uuid().defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  prefix: text('prefix').notNull(),
  value: text('value').notNull(),

  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  ...timestamps,
});

export type ApiKey = typeof apiKeys.$inferSelect;
