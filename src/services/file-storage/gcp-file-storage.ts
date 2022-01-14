import { basename } from 'path';

import { injectable } from 'tsyringe';
import { Bucket, Storage } from '@google-cloud/storage';

import IFileStorage, { IPipeable } from './file-storage';

@injectable()
export default class GcpFileStorage implements IFileStorage {
  private readonly bucket: Bucket;

  constructor(
    client: Storage,
    bucketName: string,
    private readonly fileDelete: (path: string) => Promise<void>
  ) {
    this.bucket = client.bucket(bucketName);
  }

  async put(sourcePath: string): Promise<string> {
    const filename = basename(sourcePath);

    await this.bucket.upload(sourcePath);
    await this.fileDelete(sourcePath);

    return filename;
  }

  async delete(path: string): Promise<void> {
    const file = this.bucket.file(path);

    await file.delete();
  }

  async load(path: string): Promise<IPipeable> {
    const file = this.bucket.file(path);

    const stream = file.createReadStream();

    return Promise.resolve(stream);
  }
}
