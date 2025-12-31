import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { GlobalCacheModule } from './common/global-cache.module';
import { MailModule } from './queues/email/mail.module';
import { BullDashboardModule } from './queues/dashboard/bull-dashboard.module';

import configuration from './config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { PostsModule } from './posts/posts.module';

// Middleware
import { UserContextMiddleware } from './common/middleware/user-context.middleware';
import { AuthRequestContextMiddleware } from './common/middleware/auth-request-context.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisOptions = {
          host: config.get('cache.host'),
          port: config.get('cache.port'),
        };
        console.log(`📡 [Bull] Connecting to Redis at ${redisOptions.host}:${redisOptions.port}`);
        return {
          redis: redisOptions,
        };
      },
    }),
    GlobalCacheModule,
    MailModule,
    BullDashboardModule,
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
      .apply(UserContextMiddleware, AuthRequestContextMiddleware, RateLimitMiddleware, LoggerMiddleware)
      .forRoutes('*');
  }
}
