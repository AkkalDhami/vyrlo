/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getNats } from './index';

export async function publishLogBatch(
  keyId: string,
  userId: string,
  logs: any[],
  serverRecievedAt: number,
) {
  const { nc, jc } = await getNats();

  const js = nc.jetstream();
  await js.publish(
    'logs.ingest',
    js.encode({
      keyId,
      logs,
      userId,
      serverRecievedAt,
      timestamp: Date.now(),
    }),
  );
}
