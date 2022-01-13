import { singleton } from 'tsyringe';

import Clock from '../../lib/clock';
import IRateLimit from './rate-limit';

export interface Stat {
  downloads: number;
  uploads: number;
}

@singleton()
export default class InMemoryRateLimit implements IRateLimit {
  private readonly records = new Map<string, Stat>();

  constructor(private readonly max: { uploads: number; downloads: number }) {}

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
    return this.localStat(InMemoryRateLimit.createKey(ipAddress));
  }

  private static createKey(ipAddress: string): string {
    const now = Clock.now();
    const today = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    return `${ipAddress}:${today}`;
  }

  private allowed(
    ipAddress: string,
    predicate: (stat: Stat) => boolean
  ): boolean {
    const key = InMemoryRateLimit.createKey(ipAddress);

    return predicate(this.localStat(key));
  }

  private record(ipAddress: string, action: (stat: Stat) => Stat): void {
    const key = InMemoryRateLimit.createKey(ipAddress);

    this.records.set(key, action(this.localStat(key)));
  }

  private localStat(key: string): Stat {
    return this.records.get(key) || { uploads: 0, downloads: 0 };
  }
}
