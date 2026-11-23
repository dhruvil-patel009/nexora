import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));
    const password = this.configService.get<string>('REDIS_PASSWORD', '');

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    });

    this.client.on('error', (err) => {
      this.logger.warn(`Redis client error: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis client connection closed.');
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async ping(): Promise<{ status: 'up' | 'down'; latencyMs: number }> {
    const start = Date.now();
    try {
      if (this.client.status !== 'ready' && this.client.status !== 'connecting') {
        await this.client.connect().catch(() => {});
      }
      const response = await this.client.ping();
      const latencyMs = Date.now() - start;
      return { status: response === 'PONG' ? 'up' : 'down', latencyMs };
    } catch {
      return { status: 'down', latencyMs: Date.now() - start };
    }
  }
}
