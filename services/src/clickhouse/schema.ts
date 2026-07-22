import { clickhouse } from './client';

export async function createLogsTable() {
  await clickhouse.command({
    query: `CREATE DATABASE IF NOT EXISTS logs`,
  });

  await clickhouse.command({
    query: `
    CREATE TABLE IF NOT EXISTS logs.events (
      keyId String,
      userId String,
      type LowCardinality(String),
      message String,
      appName LowCardinality(String),
      environment LowCardinality(String),
      importance Nullable(Int32),
      subsystem Nullable(String),
      service Nullable(String),
      operation Nullable(String),
      track Nullable(String),
      security Nullable(String),
      metrics Nullable(String),
      timestamp DateTime DEFAULT now(),
      ingestedAt DateTime DEFAULT now(),
      createdAt DateTime DEFAULT now()
    )
    ENGINE = MergeTree()
    PARTITION BY toYYYYMMDD(timestamp)
    ORDER BY (timestamp, keyId)
    TTL timestamp + INTERVAL 30 DAY DELETE
    SETTINGS index_granularity = 8192
  `,
  });
}
