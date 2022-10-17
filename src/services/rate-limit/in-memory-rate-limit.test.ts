import 'reflect-metadata';

import InMemoryRateLimit, { Stat } from './in-memory-rate-limit';

class InMemoryRateLimitTestDouble extends InMemoryRateLimit {
  get internalRecords(): Map<string, Stat> {
    return this.records;
  }
}

describe('InMemoryRateLimit', () => {
  const IpAddress = '127.0.0.1';

  describe('canUpload', () => {
    describe('when upload counter not reached limit', () => {
      let allowed: boolean;

      beforeAll(async () => {
        const rateLimit = new InMemoryRateLimitTestDouble({
          uploads: 5,
          downloads: 15
        });

        allowed = await rateLimit.canUpload(IpAddress);
      });

      it('returns true', () => {
        expect(allowed).toBeTruthy();
      });
    });

    describe('when upload counter reached limit', () => {
      let allowed: boolean;

      beforeAll(async () => {
        const rateLimit = new InMemoryRateLimitTestDouble({
          uploads: 2,
          downloads: 15
        });

        await rateLimit.recordUpload(IpAddress);
        await rateLimit.recordUpload(IpAddress);

        allowed = await rateLimit.canUpload(IpAddress);
      });

      it('returns false', () => {
        expect(allowed).toBeFalsy();
      });
    });
  });

  describe('recordUpload', () => {
    let oldCount: number;
    let newCount: number;

    beforeAll(async () => {
      const rateLimit = new InMemoryRateLimitTestDouble({
        uploads: 5,
        downloads: 15
      });
      let stat: Stat;

      stat = rateLimit.stat(IpAddress);
      oldCount = stat.uploads;

      await rateLimit.recordUpload(IpAddress);
      stat = rateLimit.stat(IpAddress);
      newCount = stat.uploads;
    });

    it('increments upload counter by 1', () => {
      expect(newCount).toEqual(oldCount + 1);
    });
  });

  describe('canDownload', () => {
    describe('when download counter not reached limit', () => {
      let allowed: boolean;

      beforeAll(async () => {
        const rateLimit = new InMemoryRateLimitTestDouble({
          uploads: 5,
          downloads: 15
        });

        allowed = await rateLimit.canDownload(IpAddress);
      });

      it('returns true', () => {
        expect(allowed).toBeTruthy();
      });
    });

    describe('when download counter reached limit', () => {
      let allowed: boolean;

      beforeAll(async () => {
        const rateLimit = new InMemoryRateLimitTestDouble({
          uploads: 5,
          downloads: 0
        });

        await rateLimit.recordDownload(IpAddress);
        await rateLimit.recordDownload(IpAddress);

        allowed = await rateLimit.canDownload(IpAddress);
      });

      it('returns false', () => {
        expect(allowed).toBeFalsy();
      });
    });
  });

  describe('recordDownload', () => {
    let oldCount: number;
    let newCount: number;

    beforeAll(async () => {
      const rateLimit = new InMemoryRateLimitTestDouble({
        uploads: 5,
        downloads: 15
      });

      let stat: Stat;

      stat = rateLimit.stat(IpAddress);
      oldCount = stat.downloads;

      await rateLimit.recordDownload(IpAddress);
      stat = rateLimit.stat(IpAddress);
      newCount = stat.downloads;
    });

    it('increments download counter by 1', () => {
      expect(newCount).toEqual(oldCount + 1);
    });
  });

  describe('reset', () => {
    let count: number;

    beforeAll(async () => {
      const rateLimit = new InMemoryRateLimitTestDouble({
        uploads: 5,
        downloads: 15
      });

      await rateLimit.recordUpload(IpAddress);
      await rateLimit.recordDownload(IpAddress);

      await rateLimit.reset();

      count = rateLimit.internalRecords.size;
    });

    it('resets', function () {
      expect(count).toEqual(0);
    });
  });

  describe('isLive', () => {
    it('always returns true', async () => {
      const live = await new InMemoryRateLimitTestDouble({
        uploads: 1,
        downloads: 1
      }).isLive();

      expect(live).toEqual(true);
    });
  });
});
