import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpErrorFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { getQueueToken } from '@nestjs/bull';
import { BullDashboardModule } from './queues/dashboard/bull-dashboard.module';

import helmet from 'helmet';
import compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security Hardening
  app.use(helmet());

  const allowedOrigins = configService.get<string>('CORS_ORIGINS')?.split(',') || '*';
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use(compression());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpErrorFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('NestJS Production API')
    .setDescription('The API documentation for the professional NestJS production-grade application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Setup Bull Dashboard
  const mailQueue = app.get(getQueueToken('mail'));
  BullDashboardModule.setupDashboard(app, [mailQueue]);

  const port = configService.getOrThrow('app.port');
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📝 Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();

// entry point of NestJs application
// NestFactory -> Used to create a NestJs application
// AppModule -> Root module of the appliction (Everything start from here)
// NestJs apps always start from one root module.

