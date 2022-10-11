import 'reflect-metadata';

import { RedisClientType } from '@redis/client';
import { container } from 'tsyringe';

import config from '../../config';
import RateLimit from './rate-limit';
import InMemoryRateLimit from './in-memory-rate-limit';
import RedisRateLimit from './redis-rate-limit';
import rateLimitProvider from './rate-limit-provider';

describe('rateLimitProvider', () => {
  let originalProvider: string;

  beforeAll(() => {
    originalProvider = config.rateLimit.provider;
  });

  describe('in-memory', () => {
    let rateLimit: RateLimit;

    beforeAll(() => {
      config.rateLimit.provider = 'in-memory';

      rateLimit = rateLimitProvider();
    });

    it('returns correct limit', () => {
      expect(rateLimit).toBeInstanceOf(InMemoryRateLimit);
    });
  });

  describe('redis', () => {
    let originalUrl: string;

    let rateLimit: RateLimit;

    beforeAll(() => {
      originalUrl = config.rateLimit.redis.url;

      config.rateLimit.provider = 'redis';
      config.rateLimit.redis.url = 'redis://localhost:6379';

      rateLimit = rateLimitProvider();
    });

    it('returns correct limit', () => {
      expect(rateLimit).toBeInstanceOf(RedisRateLimit);
    });

    afterAll(async () => {
      const redis = container.resolve<RedisClientType>('redisClient');
      if (redis.isReady) {
        await redis.disconnect();
      }

      config.rateLimit.redis.url = originalUrl;
    });
  });

  describe('unknown', () => {
    beforeAll(() => {
      config.rateLimit.provider = 'unknown';
    });

    it('throws exception', () => {
      expect(() => rateLimitProvider()).toThrow();
    });
  });

  afterAll(() => {
    config.rateLimit.provider = originalProvider;
  });
});
