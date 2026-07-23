import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LogsService } from './vyrlo-logs.service';
import { AuthGuard } from '@/guards/auth.guard';
import type { RequestType } from '@/types';
import type { Response } from 'express';

@Controller('logs')
@UseGuards(AuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post('send')
  async sendLogs(@Body() body: any, req: RequestType) {
    return this.logsService.sendLogs(body, req.user.keyId, req.user.id);
  }

  @Get('stream')
  async startSSE(req: RequestType, res: Response) {
    return this.logsService.startSSE(req, res);
  }
}
