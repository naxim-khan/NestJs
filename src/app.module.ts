import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

// Middleware
import { UserContextMiddleware } from './common/middleware/user-context.middleware';
import { AuthRequestContextMiddleware } from './common/middleware/auth-request-context.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');

        if (!uri) {
          throw new Error('❌ MONGO_URI is not defined in .env');
        }

        console.log('✅ Mongo URI loaded');

        return { uri };
      },
    }),

    UsersModule,
    AuthModule,
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
      .forRoutes('*'); // applies to all routes in the correct sequence
  }
}