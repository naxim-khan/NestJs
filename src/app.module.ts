import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config';

import { ConfigModule } from '@nestjs/config';
// import { ConfigService } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';


// Middleware
import { UserContextMiddleware } from './common/middleware/user-context.middleware';
import { AuthRequestContextMiddleware } from './common/middleware/auth-request-context.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
    }),
    UsersModule,
    AuthModule,
    PrismaModule,
    CommonModule,
    PostsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        UserContextMiddleware,
        AuthRequestContextMiddleware,
        RateLimitMiddleware,
        LoggerMiddleware,
      )
      .forRoutes('*');
  }
}