/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { consumerOpts } from 'nats';
import { getNats } from './index';
import { Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { clickhouse } from '@/clickhouse/client';
import { broadcastLogs } from '@/sse/sse-registry';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379') || 6379,
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0') || 0,
  maxRetriesPerRequest: 5,
  reconnectOnError: (error: Error) => {
    if (error.message.includes('READONLY')) return true;

    return false;
  },
  retryStrategy: (timesConnected: number) => {
    return Math.min(timesConnected * 200, 10000);
  },
});

const importancemap: Record<string, number> = {
  critical: 6,
  low: 1,
  medium: 2,
  high: 3,
};

let lastBacklogUpdate = 0;

function toImportance(importance: any): number | null {
  if (typeof importance === 'number') return importance;
  if (typeof importance === 'string') {
    const v = importancemap[importance.toLowerCase()];
    return v ?? null;
  }
  return null;
}

export async function startLogsCosumner() {
  const { nc, jc } = await getNats();

  const js = nc.jetstream();
  const jsm = await nc.jetstreamManager();

  const durable = 'vyrlo-log-worker';
  const subject = 'logs.ingest';
  const streamName = 'vyrlo_logs';

  // Ensure the stream exists. If the stream is missing, create a minimal stream
  // so the consumer can be created/attached without causing JetStream errors.
  try {
    await jsm.streams.info(streamName);
  } catch (err: any) {
    Logger.warn(`JetStream stream ${streamName} not found, creating it`);
    try {
      await jsm.streams.add({
        name: streamName,
        subjects: [subject],
        storage: 'file',
      });
      Logger.log(`Created JetStream stream ${streamName}`);
    } catch (createErr) {
      Logger.error(
        `Failed to create JetStream stream ${streamName}: `,
        createErr,
      );
    }
  }

  const opts = consumerOpts();
  opts.durable(durable);
  opts.manualAck();
  opts.ackExplicit();
  opts.deliverTo('vyrlo.logs.worker');

  try {
    const existing = await jsm.consumers.info(streamName, durable);

    const cfg: any = existing?.config;

    if (cfg && !cfg?.deliver_subject) {
      Logger.warn(
        `JetStream consumer ${durable} on stream ${streamName} is missing deliver subject`,
      );

      await jsm.consumers.delete(streamName, durable);
    }
  } catch (error: any) {
    // If the consumer does not exist that's expected for first-run — create it
    // via the subscribe flow below. Log as a warning instead of an error to
    // avoid noisy stack traces when the consumer is simply absent.
    if (
      error?.api_error?.err_code === 10014 ||
      error?.api_error?.code === 404
    ) {
      Logger.warn(
        `JetStream consumer ${durable} on stream ${streamName} not found — will create via subscribe`,
      );
    } else {
      Logger.error('Error checking JetStream consumer configuration: ', error);
    }
  }

  // Use the consumer options builder so the JetStream client creates the
  // durable consumer with the correct configuration when subscribing.
  const sub = await js.subscribe(subject, opts);
  Logger.log(`JetStream consumer ${durable} on stream ${streamName} started`);

  for await (const msg of sub) {
    try {
      const data = jc.decode(msg.data);

      const { keyId, userId, logs, serverRecievedAt } = data as {
        keyId: string;
        userId: string;
        logs: any[];
        serverRecievedAt: number;
      };

      const now = Date.now();
      const transformed = await Promise.all(
        logs.map(async (log: any) => {
          const latency = now - serverRecievedAt;

          await redis.lpush('ingest:latency', latency);
          await redis.ltrim('ingest:latency', 0, 59);

          const ts = log?.timestamps?.eventType
            ? new Date(log?.timestamps?.eventType).getTime()
            : now;

          const timestampSeconds = Math.floor(ts / 1000);

          return {
            keyId,
            userId,
            type: log.type,
            message: log.message,
            service: log.service,
            appName: log.appName,
            environment: log.environment,
            importance: toImportance(log.importance),
            subsystem: log.subsystem ?? null,
            operation: log.operation ?? null,
            track: log.track ? JSON.stringify(log.track) : null,
            metrics: log.metrics ? JSON.stringify(log.metrics) : null,
            timestamps: timestampSeconds,
          };
        }),
      );

      await clickhouse.insert({
        table: 'logs.events',
        values: transformed,
        format: 'JSONEachRow',
      });

      // todo usage accumulate

      broadcastLogs(transformed);

      msg.ack();

      if (now - lastBacklogUpdate > 1000) {
        lastBacklogUpdate = now;

        const info = await jsm.consumers.info(streamName, durable);

        const backlog =
          info?.num_pending ??
          info?.num_ack_pending ??
          info?.numAckPending ??
          0;

        await redis.set(`ingest:backlog`, backlog);
      }
    } catch (error) {
      Logger.error('Error processing message: ', error);
    }
  }
}
