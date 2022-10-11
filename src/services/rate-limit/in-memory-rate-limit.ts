import { inject, injectable } from 'tsyringe';

import RateLimit from './rate-limit';
import createKeyPrefix from './create-key-prefix';

export interface Stat {
  downloads: number;
  uploads: number;
}

@injectable()
export default class InMemoryRateLimit implements RateLimit {
  private readonly records = new Map<string, Stat>();

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

  stat(ipAddress: string): Stat {
    const key = createKeyPrefix(ipAddress);

    return this.localStat(key);
  }

  private allowed(
    ipAddress: string,
    predicate: (stat: Stat) => boolean
  ): boolean {
    const key = createKeyPrefix(ipAddress);

    return predicate(this.localStat(key));
  }

  private record(ipAddress: string, action: (stat: Stat) => Stat): void {
    const key = createKeyPrefix(ipAddress);

    this.records.set(key, action(this.localStat(key)));
  }

  private localStat(key: string): Stat {
    return this.records.get(key) || { uploads: 0, downloads: 0 };
  }
}
