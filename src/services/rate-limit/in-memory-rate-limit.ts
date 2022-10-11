import { inject, injectable } from 'tsyringe';

import IRateLimit from './rate-limit';
import createKeyPrefix from './create-key-prefix';

export interface IStat {
  downloads: number;
  uploads: number;
}

@injectable()
export default class InMemoryRateLimit implements IRateLimit {
  private readonly records = new Map<string, IStat>();

  constructor(
    @inject('rateLimitMax')
    private readonly max: {
      readonly uploads: number;
      readonly downloads: number;
    }
  ) {}

  async canUpload(ipAddress: string): Promise<boolean> {
    const allowed = this.allowed(
      ipAddress,
      (stat) => stat.uploads < this.max.uploads
    );

    return Promise.resolve(allowed);
  }

  async recordUpload(ipAddress: string): Promise<void> {
    this.record(ipAddress, (stat) => {
      stat.uploads++;
      return stat;
    });

    return Promise.resolve();
  }

  async canDownload(ipAddress: string): Promise<boolean> {
    const allowed = this.allowed(
      ipAddress,
      (stat) => stat.downloads < this.max.downloads
    );

    return Promise.resolve(allowed);
  }

  async recordDownload(ipAddress: string): Promise<void> {
    this.record(ipAddress, (stat) => {
      stat.downloads++;
      return stat;
    });

    return Promise.resolve();
  }

  stat(ipAddress: string): IStat {
    const key = createKeyPrefix(ipAddress);

    return this.localStat(key);
  }

  private allowed(
    ipAddress: string,
    predicate: (stat: IStat) => boolean
  ): boolean {
    const key = createKeyPrefix(ipAddress);

    return predicate(this.localStat(key));
  }

  private record(ipAddress: string, action: (stat: IStat) => IStat): void {
    const key = createKeyPrefix(ipAddress);

    this.records.set(key, action(this.localStat(key)));
  }

  private localStat(key: string): IStat {
    return this.records.get(key) || { uploads: 0, downloads: 0 };
  }
}
