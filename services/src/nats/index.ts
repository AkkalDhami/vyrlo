/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Logger } from '@nestjs/common';
import { JSONCodec, connect } from 'nats';

let natsConnection: any = null;

const jc = JSONCodec();

export async function getNats() {
  if (!natsConnection) {
    natsConnection = await connect({
      servers: process.env.NATS_URL || 'nats://localhost:4222',
      name: 'vyrlo-server',
    });

    Logger.log('Connected to NATS');
  }
  return {
    nc: natsConnection,
    jc,
  };
}
