/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { publishLogBatch } from '@/nats/producer';

import { Response, Request } from 'express';
import { clickhouse } from '@/clickhouse/client';
import { addClient } from '@/sse/sse-registry';

@Injectable()
export class LogsService {
  constructor() {}

  async sendLogs(body: any, keyId: string, userId: string) {
    const serverRecievedAt = Date.now();
    await publishLogBatch(keyId, userId, body.logs, serverRecievedAt);

    return {
      message: 'Logs sent successfully',
    };
  }

  async startSSE(req: Request & { user: { id: string } }, res: Response) {
    const userId = req.user.id;

    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 500)
      : 500;

    const type = req.query.type as string | undefined;
    const env = req.query.env as string | undefined;
    const appName = req.query.appName as string | undefined;
    const search = req.query.search as string | undefined;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const condition = [`userId = '{userId:String}'`];
    if (type) condition.push(`type = '{type:String}'`);
    if (env) condition.push(`environment = '{env:String}'`);
    if (appName) condition.push(`appName = '{appName:String}'`);
    if (search) condition.push(`message ILIKE '{search:String}'`);

    const query = `
    SELECT *
    FROM logs.events
    WHERE ${condition.join(' AND ')}
    ORDER BY timestamp DESC
    LIMIT ${limit}
    `;

    const rs = await clickhouse.query({
      query,
      format: 'JSONEachRow',
      query_params: {
        userId,
        type,
        env,
        appName,
        search,
        limit,
      },
    });

    const initialRows = await rs.json();

    res.write(
      `data: ${JSON.stringify({
        type: 'initial',
        data: initialRows.reverse(),
      })}\n\n`,
    );

    addClient(res, {
      userId,
      type,
      env,
      appName,
      search,
    });

    req.on('close', () => {
      res.end();
    });
  }
}
