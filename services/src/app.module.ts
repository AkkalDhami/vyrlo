import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiKeyModule } from './modules/api-key/api-key.module';
import { BillingModule } from './modules/billing/billing.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './infra/redis.module';
import { LogsModule } from './modules/vyrlo-logs/vyrlo-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ApiKeyModule,
    BillingModule,
    DatabaseModule,
    RedisModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
