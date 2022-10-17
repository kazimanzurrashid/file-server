import { singleton } from 'tsyringe';

import clock from '../../lib/clock';
import FileRepository, { AddFileInfo, FileInfo } from './file-repository';

@singleton()
export default class InMemoryFileRepository implements FileRepository {
  private readonly _records: FileInfo[] = [];

  protected get records(): FileInfo[] {
    return this._records;
  }

  async add(arg: AddFileInfo): Promise<void> {
    const info = {
      ...arg,
      lastActivity: clock.now()
    };

    this.records.push(info);

    return Promise.resolve();
  }

  async delete(privateKey: string): Promise<FileInfo | undefined> {
    const index = this.records.findIndex((fi) => fi.privateKey === privateKey);

    if (index > -1) {
      const deleted = this.records.splice(index, 1);

      return Promise.resolve(deleted[0]);
    }

    return Promise.resolve(undefined);
  }

  async get(publicKey: string): Promise<FileInfo | undefined> {
    const info = this.records.find((fi) => fi.publicKey === publicKey);

    if (info) {
      info.lastActivity = clock.now();
    }

    return Promise.resolve(info);
  }

  async listInactiveSince(timestamp: Date, max = 25): Promise<FileInfo[]> {
    const filtered = this.records
      .filter((fi) => fi.lastActivity.getTime() <= timestamp.getTime())
      .slice(0, max);

    return Promise.resolve(filtered);
  }

  async isLive(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
