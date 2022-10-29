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

  describe('reset', () => {
    let mockedKeys: jest.Mock;
    let mockedDelete: jest.Mock;

    beforeAll(async () => {
      mockedKeys = jest.fn(async () => Promise.resolve(['key1']));
      mockedDelete = jest.fn(async () => Promise.resolve());

      const rateLimit = new RedisRateLimit(
        {
          uploads: 0,
          downloads: 0
        },
        {
          keys: mockedKeys,
          del: mockedDelete
        } as unknown as RedisClientType
      );

      await rateLimit.reset();
    });

    it('delegates to redis keys and del', () => {
      expect(mockedKeys).toHaveBeenCalled();
      expect(mockedDelete).toHaveBeenCalled();
    });
  });

  describe('isLive', () => {
    describe('when up', () => {
      let res: boolean;

      beforeAll(async () => {
        const mockedPing = jest.fn(async () => Promise.resolve());

        const rateLimit = new RedisRateLimit(
          {
            uploads: 0,
            downloads: 0
          },
          {
            ping: mockedPing
          } as unknown as RedisClientType
        );

        res = await rateLimit.isLive();
      });

      it('returns true', () => {
        expect(res).toEqual(true);
      });
    });

    describe('when down', () => {
      let res: boolean;

      beforeAll(async () => {
        const mockedPing = jest.fn(async () => Promise.reject(new Error()));

        const rateLimit = new RedisRateLimit(
          {
            uploads: 0,
            downloads: 0
          },
          {
            ping: mockedPing
          } as unknown as RedisClientType
        );

        res = await rateLimit.isLive();
      });

      it('returns false', () => {
        expect(res).toEqual(false);
      });
    });
  });
});
