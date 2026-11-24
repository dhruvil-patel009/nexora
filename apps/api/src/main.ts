import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('NexoraBootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 4000;
  const apiPrefix = process.env.API_PREFIX || 'api/v1';

  // 1. Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for Swagger UI compatibility
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. Correlation Request-ID Tracking Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  });

  // 3. Global API Prefix
  app.setGlobalPrefix(apiPrefix);

  // 4. Global Validation Pipe with strict whitelisting
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 5. Hardened CORS Configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id', 'x-request-id'],
    exposedHeaders: ['x-request-id'],
    credentials: true,
  });

  // 6. Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NEXORA API')
    .setDescription('Automate Beyond Limits — Visual workflow automation and orchestration API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  logger.log(`🚀 NEXORA API server running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Interactive OpenAPI documentation available on: http://localhost:${port}/docs`);
}

bootstrap();
