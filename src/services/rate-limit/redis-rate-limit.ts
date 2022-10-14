import { inject, injectable } from 'tsyringe';
import { RedisClientType } from '@redis/client';

import RateLimit from './rate-limit';
import createKeyPrefix from './create-key-prefix';

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

@injectable()
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
    const key = `${createKeyPrefix(ipAddress)}:uploads`;

    const uploads = Number(await this.client.get(key));

    return uploads < this.max.uploads;
  }

  async recordUpload(ipAddress: string): Promise<void> {
    const key = `${createKeyPrefix(ipAddress)}:uploads`;

    await this.client.multi().incr(key).expire(key, ONE_DAY_IN_SECONDS).exec();
  }

  async canDownload(ipAddress: string): Promise<boolean> {
    const key = `${createKeyPrefix(ipAddress)}:downloads`;

    const downloads = Number(await this.client.get(key));

    return downloads < this.max.downloads;
  }

  async recordDownload(ipAddress: string): Promise<void> {
    const key = `${createKeyPrefix(ipAddress)}:downloads`;

    await this.client.multi().incr(key).expire(key, ONE_DAY_IN_SECONDS).exec();
  }
}
