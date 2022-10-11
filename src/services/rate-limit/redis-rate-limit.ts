import { inject, injectable } from 'tsyringe';
import { RedisClientType } from '@redis/client';

import IRateLimit from './rate-limit';
import createKeyPrefix from './create-key-prefix';

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

@injectable()
export default class RedisRateLimit implements IRateLimit {
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

    const uploads = await this.client.get(key);

    return Number(uploads || '0') < this.max.uploads;
  }

  async recordUpload(ipAddress: string): Promise<void> {
    const key = `${createKeyPrefix(ipAddress)}:uploads`;

    await this.client.multi().incr(key).expire(key, ONE_DAY_IN_SECONDS).exec();
  }

  async canDownload(ipAddress: string): Promise<boolean> {
    const key = `${createKeyPrefix(ipAddress)}:downloads`;

    const downloads = await this.client.get(key);

    return Number(downloads || '0') < this.max.downloads;
  }

  async recordDownload(ipAddress: string): Promise<void> {
    const key = `${createKeyPrefix(ipAddress)}:downloads`;

    await this.client.multi().incr(key).expire(key, ONE_DAY_IN_SECONDS).exec();
  }
}
