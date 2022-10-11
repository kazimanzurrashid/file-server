import 'reflect-metadata';

import { RedisClientType } from '@redis/client';

import RedisRateLimit from './redis-rate-limit';

describe('RedisRateLimit', () => {
  const IpAddress = '127.0.0.1';

  describe('canUpload', () => {
    describe('when upload counter not reached limit', () => {
      let allowed: boolean;

      beforeAll(async () => {
        const rateLimit = new RedisRateLimit(
          {
            uploads: 5,
            downloads: 15
          },
          {
            get: async () => Promise.resolve('4')
          } as RedisClientType
        );

        allowed = await rateLimit.canUpload(IpAddress);
      });

      it('returns true', () => {
        expect(allowed).toBeTruthy();
      });
    });

    describe('when upload counter reached limit', () => {
      let allowed: boolean;

      beforeAll(async () => {
        const rateLimit = new RedisRateLimit(
          {
            uploads: 5,
            downloads: 15
          },
          {
            get: async () => Promise.resolve('5')
          } as RedisClientType
        );

        allowed = await rateLimit.canUpload(IpAddress);
      });

      it('returns false', () => {
        expect(allowed).toBeFalsy();
      });
    });
  });

  describe('recordUpload', () => {
    let mockedExpire: jest.Mock;
    let mockedIncrement: jest.Mock;

    beforeAll(async () => {
      mockedExpire = jest.fn(() => ({
        exec: jest.fn(async () => Promise.resolve())
      }));
      mockedIncrement = jest.fn(() => ({
        expire: mockedExpire
      }));
      const mockedMulti = jest.fn(() => ({
        incr: mockedIncrement
      }));

      const rateLimit = new RedisRateLimit(
        {
          uploads: 5,
          downloads: 15
        },
        {
          multi: mockedMulti
        } as unknown as RedisClientType
      );

      await rateLimit.recordUpload(IpAddress);
    });

    it('increments counter', () => {
      expect(mockedIncrement).toHaveBeenCalled();
    });

    it('add expiration to counter ', () => {
      expect(mockedExpire).toHaveBeenCalled();
    });
  });

  describe('canDownload', () => {
    describe('when download counter not reached limit', () => {
      let allowed: boolean;

      beforeAll(async () => {
        const rateLimit = new RedisRateLimit(
          {
            uploads: 5,
            downloads: 15
          },
          {
            get: async () => Promise.resolve('14')
          } as RedisClientType
        );

        allowed = await rateLimit.canDownload(IpAddress);
      });

      it('returns true', () => {
        expect(allowed).toBeTruthy();
      });
    });

    describe('when download counter reached limit', () => {
      let allowed: boolean;

      beforeAll(async () => {
        const rateLimit = new RedisRateLimit(
          {
            uploads: 5,
            downloads: 15
          },
          {
            get: async () => Promise.resolve('15')
          } as RedisClientType
        );

        allowed = await rateLimit.canDownload(IpAddress);
      });

      it('returns false', () => {
        expect(allowed).toBeFalsy();
      });
    });
  });

  describe('recordDownload', () => {
    let mockedExpire: jest.Mock;
    let mockedIncrement: jest.Mock;

    beforeAll(async () => {
      mockedExpire = jest.fn(() => ({
        exec: jest.fn(async () => Promise.resolve())
      }));
      mockedIncrement = jest.fn(() => ({
        expire: mockedExpire
      }));
      const mockedMulti = jest.fn(() => ({
        incr: mockedIncrement
      }));

      const rateLimit = new RedisRateLimit(
        {
          uploads: 5,
          downloads: 15
        },
        {
          multi: mockedMulti
        } as unknown as RedisClientType
      );

      await rateLimit.recordDownload(IpAddress);
    });

    it('increments counter', () => {
      expect(mockedIncrement).toHaveBeenCalled();
    });

    it('add expiration to counter ', () => {
      expect(mockedExpire).toHaveBeenCalled();
    });
  });
});
