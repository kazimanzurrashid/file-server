import { inject, singleton } from 'tsyringe';

import RateLimit from './rate-limit';
import { prefix } from './prefix';

export interface Stat {
  downloads: number;
  uploads: number;
}

@singleton()
export default class InMemoryRateLimit implements RateLimit {
  private readonly _records = new Map<string, Stat>();

  constructor(
    @inject('rateLimitMax')
    private readonly max: {
      readonly uploads: number;
      readonly downloads: number;
    }
  ) {}

  protected get records(): Map<string, Stat> {
    return this._records;
  }

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

  async reset(): Promise<void> {
    this.records.clear();

    return Promise.resolve();
  }

  async isLive(): Promise<boolean> {
    return Promise.resolve(true);
  }

  stat(ipAddress: string): Stat {
    const key = prefix(ipAddress);

    return this.localStat(key);
  }

  private allowed(
    ipAddress: string,
    predicate: (stat: Stat) => boolean
  ): boolean {
    const key = prefix(ipAddress);

    return predicate(this.localStat(key));
  }

  private record(ipAddress: string, action: (stat: Stat) => Stat): void {
    const key = prefix(ipAddress);

    this.records.set(key, action(this.localStat(key)));
  }

  private localStat(key: string): Stat {
    return this.records.get(key) || { uploads: 0, downloads: 0 };
  }
}
