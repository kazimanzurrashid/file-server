import { basename } from 'path';
import { ReadStream } from 'fs';
import { Stream } from 'stream';

import { injectable } from 'tsyringe';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';

import IFileStorage from './file-storage';

@injectable()
export default class AwsFileStorage implements IFileStorage {
  constructor(
    private readonly client: S3Client,
    private readonly bucketName: string,
    private readonly fs: {
      delete: (path: string) => Promise<void>;
      createReadStream: (path: string) => ReadStream;
    }
  ) {}

  async put(sourcePath: string): Promise<string> {
    const filename = basename(sourcePath);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
      Body: this.fs.createReadStream(sourcePath)
    });

    await this.client.send(command);

    await this.fs.delete(sourcePath);

    return filename;
  }

  async delete(path: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: path
    });

    await this.client.send(command);
  }

  async load(path: string): Promise<Stream> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: path
    });

    const res = await this.client.send(command);

    return res.Body as unknown as Stream;
  }
}
