import { Module, Global, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { createCache } from 'cache-manager';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

@Global()
@Module({
  providers: [
    {
      provide: CACHE_MANAGER,
      useFactory: async (config: ConfigService) => {
        const redisUrl = `redis://${config.get('cache.host')}:${config.get('cache.port')}`;

        try {
          const store = new KeyvRedis(redisUrl);
          const keyv = new Keyv({ store, namespace: 'cache' });

          // Use the verified 'stores' array pattern for v7
          const cache = createCache({
            stores: [keyv as any],
          });

          return cache;
        } catch (error) {
          const logger = new Logger('GlobalCacheModule');
          logger.error('❌ [CACHE] Failed to initialize Redis cache:', error);
          throw error;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [CACHE_MANAGER],
})
export class GlobalCacheModule {}
