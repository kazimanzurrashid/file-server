import { ReadStream } from 'fs';
import { basename, join } from 'path';

import { inject, injectable } from 'tsyringe';

import FileStorage, { Pipeable } from './file-storage';

@injectable()
export default class LocalFileStorage implements FileStorage {
  constructor(
    @inject('localStorageLocation')
    private readonly storageLocation: string,
    @inject('fsCopyFile')
    private readonly fileCopy: (
      source: string,
      destination: string
    ) => Promise<void>,
    @inject('fsUnlink')
    private readonly fileDelete: (path: string) => Promise<void>,
    @inject('fsCreateReadStream')
    private readonly fileCreateReadStream: (path: string) => ReadStream
  ) {}

  async put(sourcePath: string): Promise<string> {
    const filename = basename(sourcePath);
    const targetPath = join(this.storageLocation, filename);

    await this.fileCopy(sourcePath, targetPath);

    return filename;
  }

  async delete(path: string): Promise<void> {
    const fullPath = join(this.storageLocation, path);

    return this.fileDelete(fullPath);
  }

  async load(path: string): Promise<Pipeable> {
    const fullPath = join(this.storageLocation, path);

    const stream = this.fileCreateReadStream(fullPath);

    return Promise.resolve(stream);
  }

  async isLive(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
