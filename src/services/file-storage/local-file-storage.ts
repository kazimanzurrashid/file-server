import { ReadStream } from 'fs';
import { basename, join } from 'path';
import { Stream } from 'stream';

import { injectable } from 'tsyringe';

import IFileStorage from './file-storage';

@injectable()
export default class LocalFileStorage implements IFileStorage {
  constructor(
    private readonly storageLocation: string,
    private readonly fs: {
      delete: (path: string) => Promise<void>;
      copyFile: (source: string, destination: string) => Promise<void>;
      createReadStream: (path: string) => ReadStream;
    }
  ) {}

  async put(sourcePath: string): Promise<string> {
    const filename = basename(sourcePath);
    const targetPath = join(this.storageLocation, filename);

    await this.fs.copyFile(sourcePath, targetPath);
    await this.fs.delete(sourcePath);

    return filename;
  }

  async delete(path: string): Promise<void> {
    const fullPath = join(this.storageLocation, path);

    return this.fs.delete(fullPath);
  }

  async load(path: string): Promise<Stream> {
    const fullPath = join(this.storageLocation, path);

    const stream = this.fs.createReadStream(fullPath);

    return Promise.resolve(stream);
  }
}
