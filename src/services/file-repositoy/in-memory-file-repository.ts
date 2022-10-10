import { singleton } from 'tsyringe';

import clock from '../../lib/clock';
import IFileRepository, { AddFileInfo, IFileInfo } from './file-repository';

@singleton()
export default class InMemoryFileRepository implements IFileRepository {
  constructor(private readonly records: IFileInfo[] = []) {}

  async add(arg: AddFileInfo): Promise<void> {
    const info = {
      ...arg,
      lastActivity: clock.now()
    };

    this.records.push(info);

    return Promise.resolve();
  }

  async delete(privateKey: string): Promise<IFileInfo | undefined> {
    const index = this.records.findIndex((fi) => fi.privateKey === privateKey);

    if (index > -1) {
      const deleted = this.records.splice(index, 1);

      return Promise.resolve(deleted[0]);
    }

    return Promise.resolve(undefined);
  }

  async get(publicKey: string): Promise<IFileInfo | undefined> {
    const info = this.records.find((fi) => fi.publicKey === publicKey);

    if (info) {
      info.lastActivity = clock.now();
    }

    return Promise.resolve(info);
  }

  async listInactiveSince(timestamp: Date, max: number = 25): Promise<IFileInfo[]> {
    const filtered = this.records.filter(
      (fi) => fi.lastActivity.getTime() <= timestamp.getTime()
    ).slice(0, max);

    return Promise.resolve(filtered);
  }
}
