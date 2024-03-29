import { basename } from 'path';

import { inject, singleton } from 'tsyringe';
import { Bucket, Storage } from '@google-cloud/storage';

import FileStorage, { Pipeable } from './file-storage';

@singleton()
export default class GcpFileStorage implements FileStorage {
  private readonly bucket: Bucket;

  constructor(
    @inject('storageClient')
    client: Storage,
    @inject('gcpBucketName')
    bucketName: string
  ) {
    this.bucket = client.bucket(bucketName);
  }

  async put(sourcePath: string): Promise<string> {
    const filename = basename(sourcePath);

    await this.bucket.upload(sourcePath);

    return filename;
  }

  async delete(path: string): Promise<void> {
    const file = this.bucket.file(path);

    await file.delete();
  }

  async load(path: string): Promise<Pipeable> {
    const file = this.bucket.file(path);

    const stream = file.createReadStream();

    return Promise.resolve(stream);
  }

  async isLive(): Promise<boolean> {
    try {
      const exists = await this.bucket.exists();

      return exists?.every((x) => x);
    } catch (e) {
      return false;
    }
  }
}
