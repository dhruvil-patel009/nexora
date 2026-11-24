import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ServiceHealth } from '@nexora/shared';

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async checkHealth(@Res({ passthrough: true }) res: Response): Promise<ServiceHealth> {
    const [dbHealth, redisHealth] = await Promise.all([
      this.prisma.ping(),
      this.redis.ping(),
    ]);

    const isHealthy = dbHealth.status === 'up' && redisHealth.status === 'up';
    const isDegraded = dbHealth.status === 'up' || redisHealth.status === 'up';

    if (!isHealthy) {
      res.status(isDegraded ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      status: isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: '0.1.0',
      services: {
        database: dbHealth,
        redis: redisHealth,
      },
    };
  }
}
