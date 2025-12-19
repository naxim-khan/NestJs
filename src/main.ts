import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

// entry point of NestJs application
// NestFactory -> Used to create a NestJs application
// AppModule -> Root module of the appliction (Everything start from here)
// NestJs apps always start from one root module.

