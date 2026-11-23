import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('NexoraBootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 4000;
  const apiPrefix = process.env.API_PREFIX || 'api/v1';

  // Global API Prefix
  app.setGlobalPrefix(apiPrefix);

  // Global Validation Pipe with strict whitelisting
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS Configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: true,
  });

  // Swagger OpenAPI Documentation
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
