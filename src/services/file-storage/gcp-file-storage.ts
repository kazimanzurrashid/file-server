import { basename } from 'path';
import { Stream } from 'stream';

import { injectable } from 'tsyringe';

import IFileStorage from './file-storage';
import { Bucket, Storage } from '@google-cloud/storage';

@injectable()
export default class GcpFileStorage implements IFileStorage {
  private readonly bucket: Bucket;

  constructor(
    private readonly client: Storage,
    bucketName: string,
    private readonly fileDelete: (path: string) => Promise<void>
  ) {
    this.bucket = this.client.bucket(bucketName);
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

  load(path: string): Stream {
    const file = this.bucket.file(path);

    return file.createReadStream();
  }
}
