import { basename } from 'path';
import { ReadStream } from 'fs';

import { inject, singleton } from 'tsyringe';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';

import FileStorage, { Pipeable } from './file-storage';

@singleton()
export default class AwsFileStorage implements FileStorage {
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

  async load(path: string): Promise<Pipeable> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: path
    });

    const { Body } = await this.client.send(command);

    return Body as Pipeable;
  }

  async isLive(): Promise<boolean> {
    try {
      const command = new HeadBucketCommand({
        Bucket: this.bucketName
      });

      await this.client.send(command);

      return true;
    } catch (e) {
      return false;
    }
  }
}
