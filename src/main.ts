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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Hardening
  app.use(helmet());
  app.enableCors({
    origin: '*', // In production, replace with specific origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.use(compression());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpErrorFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  const configService = app.get(ConfigService);

  // Setup Bull Dashboard
  const mailQueue = app.get(getQueueToken('mail'));
  BullDashboardModule.setupDashboard(app, [mailQueue]);

  await app.listen(configService.getOrThrow('app.port'));
}
bootstrap();

// entry point of NestJs application
// NestFactory -> Used to create a NestJs application
// AppModule -> Root module of the appliction (Everything start from here)
// NestJs apps always start from one root module.

