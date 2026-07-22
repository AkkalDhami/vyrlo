import { createClient } from '@clickhouse/client';

const requiredEnvVars = {
  CLICKHOUSE_URL: process.env.CLICKHOUSE_URL,
  CLICKHOUSE_USER: process.env.CLICKHOUSE_USER,
  CLICKHOUSE_PASSWORD: process.env.CLICKHOUSE_PASSWORD,
  CLICKHOUSE_DB: process.env.CLICKHOUSE_DB,
};

// const missingVars = Object.entries(requiredEnvVars)
//   .filter(([, value]) => !value)
//   .map(([key]) => key);

// console.log({ missingVars });

// if (missingVars.length > 0) {
//   throw new Error(
//     `Missing required environment variables: ${missingVars.join(', ')}`,
//   );
// }

export const clickhouse = createClient({
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  database: process.env.CLICKHOUSE_DB || 'default',
});
