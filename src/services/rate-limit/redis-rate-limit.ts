import { inject, singleton } from 'tsyringe';
import { RedisClientType } from '@redis/client';

import RateLimit from './rate-limit';
import { generateTimestamp, prefix } from './prefix';

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

@singleton()
export default class RedisRateLimit implements RateLimit {
  constructor(
    @inject('rateLimitMax')
    private readonly max: {
      readonly uploads: number;
      readonly downloads: number;
    },
    @inject('redisClient')
    private readonly client: RedisClientType
  ) {}

  async canUpload(ipAddress: string): Promise<boolean> {
    return this.allowed(`${prefix(ipAddress)}:uploads`, this.max.uploads);
  }

  async recordUpload(ipAddress: string): Promise<void> {
    await this.record(`${prefix(ipAddress)}:uploads`);
  }

  async canDownload(ipAddress: string): Promise<boolean> {
    return this.allowed(`${prefix(ipAddress)}:downloads`, this.max.downloads);
  }

  async recordDownload(ipAddress: string): Promise<void> {
    await this.record(`${prefix(ipAddress)}:downloads`);
  }

  async reset(): Promise<void> {
    const pattern = `${generateTimestamp()}:*`;
    const keys = await this.client.keys(pattern);

    await this.client.del(keys);
  }

  async isLive(): Promise<boolean> {
    try {
      await this.client.ping();

      return true;
    } catch (e) {
      return false;
    }
  }

  private async allowed(key: string, max: number): Promise<boolean> {
    const count = Number(await this.client.get(key));

    return count < max;
  }

  private async record(key: string): Promise<void> {
    await this.client.multi().incr(key).expire(key, ONE_DAY_IN_SECONDS).exec();
  }
}
