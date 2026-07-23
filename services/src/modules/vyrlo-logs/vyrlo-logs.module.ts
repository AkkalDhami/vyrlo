import { Module } from '@nestjs/common';
import { LogsService } from './vyrlo-logs.service';
import { LogsController } from './vyrlo-logs.controller';

@Module({
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule {}
