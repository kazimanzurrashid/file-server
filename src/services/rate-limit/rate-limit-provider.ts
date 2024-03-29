import type { DependencyContainer } from 'tsyringe';
import type { RedisClientOptions, RedisClientType } from '@redis/client';

import config from '../../config';
import type RateLimit from './rate-limit';
import InMemoryRateLimit from './in-memory-rate-limit';
import RedisRateLimit from './redis-rate-limit';

export default function rateLimitProvider(
  container: DependencyContainer
): RateLimit {
  container.registerInstance('rateLimitMax', {
    uploads: config.rateLimit.max.uploads,
    downloads: config.rateLimit.max.downloads
  });

  switch (config.rateLimit.provider) {
    case 'in-memory': {
      return container.resolve(InMemoryRateLimit);
    }
    case 'redis': {
      const opt: RedisClientOptions = {
        url: config.rateLimit.redis.uri
      };

      const client =
        container.resolve<(_: RedisClientOptions) => RedisClientType>(
          'redisFactory'
        )(opt);

      container.registerInstance('redisClient', client);

      client.connect();

      return container.resolve(RedisRateLimit);
    }
    default: {
      throw new Error(
        `Unsupported rate limit provider: "${config.rateLimit.provider}"!`
      );
    }
  }
}
