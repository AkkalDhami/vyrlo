/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Logger } from '@nestjs/common';
import { getNats } from './index';

export async function initNatsStream() {
  const { nc } = await getNats();

  const jsm = await nc.jetstreamManager();

  await jsm.streams.add({
    name: 'vyrlo_logs',
    subjects: ['logs.ingest'],
    retention: 'workqueue',
    storage: 'file',
    max_ags: 0,
    max_msgs: -1,
  });

  Logger.log('JetStream stream vyrlo_logs initialized!');
}
