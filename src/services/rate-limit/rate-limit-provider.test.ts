import 'reflect-metadata';

import { container } from 'tsyringe';

import type { RedisClientOptions, RedisClientType } from '@redis/client';

import config from '../../config';
import type RateLimit from './rate-limit';
import rateLimitProvider from './rate-limit-provider';
import InMemoryRateLimit from './in-memory-rate-limit';
import RedisRateLimit from './redis-rate-limit';

describe('rateLimitProvider', () => {
  let originalProvider: string;

  beforeAll(() => {
    originalProvider = config.rateLimit.provider;
  });

  describe('in-memory', () => {
    let rateLimit: RateLimit;

    beforeAll(() => {
      config.rateLimit.provider = 'in-memory';

      rateLimit = rateLimitProvider(container);
    });

    it('returns correct limit', () => {
      expect(rateLimit).toBeInstanceOf(InMemoryRateLimit);
    });
  });

  describe('redis', () => {
    describe('success', () => {
      let rateLimit: RateLimit;

      beforeAll(() => {
        config.rateLimit.provider = 'redis';

        const mockedConnect = jest.fn(async () => Promise.resolve());

        container.registerInstance<(_: RedisClientOptions) => RedisClientType>(
          'redisFactory',
          () => {
            return {
              connect: mockedConnect
            } as unknown as RedisClientType;
          }
        );

        rateLimit = rateLimitProvider(container);
      });

      it('returns correct limit', () => {
        expect(rateLimit).toBeInstanceOf(RedisRateLimit);
      });
    });
  });

  describe('unknown', () => {
    beforeAll(() => {
      config.rateLimit.provider = 'unknown';
    });

    it('throws exception', () => {
      expect(() => rateLimitProvider(container)).toThrow();
    });
  });

  afterAll(() => {
    config.rateLimit.provider = originalProvider;
  });
});
