import { basename } from 'path';

import { inject, injectable } from 'tsyringe';
import { Bucket, Storage } from '@google-cloud/storage';

import IFileStorage, { IPipeable } from './file-storage';

@injectable()
export default class GcpFileStorage implements IFileStorage {
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

  async load(path: string): Promise<IPipeable> {
    const file = this.bucket.file(path);

    const stream = file.createReadStream();

    return Promise.resolve(stream);
  }
}
