import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { EngineModule } from './modules/engine/engine.module';
import { ExecutionsModule } from './modules/executions/executions.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { CredentialsModule } from './modules/credentials/credentials.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    RedisModule,
    HealthModule,
    AuthModule,
    WorkflowsModule,
    EngineModule,
    ExecutionsModule,
    WebhooksModule,
    CredentialsModule,
  ],
})
export class AppModule {}
