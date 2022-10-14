import { container } from 'tsyringe';
import { createClient } from '@redis/client';
import { Logger } from 'pino';
import type { RedisClientOptions } from '@redis/client/dist/lib/client';

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
      const opt: RedisClientOptions = {
        url: config.rateLimit.redis.uri
      };

      if (process.env.NODE_ENV == 'test') {
        if (!opt.socket) {
          opt.socket = {}
        }

        opt.socket.reconnectStrategy = (_): Error => {
          return new Error('Failed to reconnect!');
        }
      }

      const client = createClient(opt);

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
