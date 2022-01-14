import { basename } from 'path';
import { ReadStream } from 'fs';

import { inject, injectable } from 'tsyringe';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';

import IFileStorage, { IPipeable } from './file-storage';

@injectable()
export default class AwsFileStorage implements IFileStorage {
  constructor(
    @inject('s3Client')
    private readonly client: S3Client,
    @inject('awsBucketName')
    private readonly bucketName: string,
    @inject('fsCreateReadStream')
    private readonly fileCreateReadStream: (path: string) => ReadStream
  ) {}

  async put(sourcePath: string): Promise<string> {
    const filename = basename(sourcePath);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
      Body: this.fileCreateReadStream(sourcePath)
    });

    await this.client.send(command);

    return filename;
  }

  async delete(path: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: path
    });

    await this.client.send(command);
  }

  async load(path: string): Promise<IPipeable> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: path
    });

    const res = await this.client.send(command);

    return res.Body as IPipeable;
  }
}
