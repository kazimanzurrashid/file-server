import { container } from 'tsyringe';
import { createClient } from '@redis/client';
import { Logger } from 'pino';

import config from '../../config';
import RateLimit from './rate-limit';
import InMemoryRateLimit from './in-memory-rate-limit';
import RedisRateLimit from './redis-rate-limit';

export default function rateLimitProvider(): RateLimit {
  container.registerInstance('rateLimitMax', {
    uploads: config.rateLimit.max.uploads,
    downloads: config.rateLimit.max.downloads
  });

  switch (config.rateLimit.provider.toLowerCase()) {
    case 'in-memory':
    case 'local': {
      return container.resolve(InMemoryRateLimit);
    }
    case 'redis': {
      const client = createClient({
        url: config.rateLimit.redis.uri,
        socket: {
          reconnectStrategy(retries: number): number | Error {
            if (retries > 3) {
              return new Error('Already retried 3 times');
            }

            return Math.min(retries * 500, 500);
          }
        }
      });

      client.on('error', (error) => {
        if (container.isRegistered<Logger>('Logger')) {
          container
            .resolve<Logger>('Logger')
            .error(error, 'redis client error');
        }
      });

      client
        .connect()
        // eslint-disable-next-line github/no-then
        .then(
          () => {
            if (container.isRegistered<Logger>('Logger')) {
              container
                .resolve<Logger>('Logger')
                .info('redis client connected');
            }
          },
          (reason) => {
            if (container.isRegistered<Logger>('Logger')) {
              container
                .resolve<Logger>('Logger')
                .error(reason, 'redis connection error');
            }
          }
        );

      container.registerInstance('redisClient', client);

      return container.resolve(RedisRateLimit);
    }
    default: {
      throw new Error(
        `Unsupported rate limit provider: "${config.rateLimit.provider}"!`
      );
    }
  }
}
