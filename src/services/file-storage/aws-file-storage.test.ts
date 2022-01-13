import 'reflect-metadata';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';

import AwsFileStorage from './aws-file-storage';
import { Stream } from 'stream';

describe('AwsFileStorage', () => {
  const Bucket = 'my-bucket';
  const Filename = 'my-file.png';
  const FilePath = `/temp/${Filename}`;

  describe('#put', () => {
    let mockedFileCreateReadStream: jest.Mock;
    let mockedFileDelete: jest.Mock;
    let mockedS3Send: jest.Mock;
    let s3SendCommand;

    let path: string;

    beforeAll(async () => {
      mockedFileCreateReadStream = jest.fn(async () => Promise.resolve({}));
      mockedFileDelete = jest.fn(async () => Promise.resolve());

      const fs = {
        delete: mockedFileDelete,
        createReadStream: mockedFileCreateReadStream
      };

      mockedS3Send = jest.fn(async () => Promise.resolve());

      const s3 = {
        send: mockedS3Send
      };

      const storage = new AwsFileStorage(s3 as unknown as S3Client, Bucket, fs);

      path = await storage.put(FilePath);
      s3SendCommand = mockedS3Send.mock.calls[0][0];
    });

    it('reads the source file', () => {
      expect(mockedFileCreateReadStream).toHaveBeenCalled();
    });

    it('uploads the file', () => {
      expect(mockedS3Send).toHaveBeenCalled();
      expect(s3SendCommand).toBeInstanceOf(PutObjectCommand);
    });

    it('deletes the source file', () => {
      expect(mockedFileDelete).toHaveBeenCalled();
    });

    it('returns the filename', () => {
      expect(path).toEqual(Filename);
    });
  });

  describe('#delete', () => {
    let mockedS3Send: jest.Mock;
    let s3SendCommand;

    beforeAll(async () => {
      mockedS3Send = jest.fn(async () => Promise.resolve());

      const s3 = {
        send: mockedS3Send
      };

      const storage = new AwsFileStorage(
        s3 as unknown as S3Client,
        Bucket,
        undefined
      );

      await storage.delete(Filename);
      s3SendCommand = mockedS3Send.mock.calls[0][0];
    });

    it('deletes file', () => {
      expect(mockedS3Send).toHaveBeenCalled();
      expect(s3SendCommand).toBeInstanceOf(DeleteObjectCommand);
    });
  });

  describe('#load', () => {
    let mockedS3Send: jest.Mock;
    let s3SendCommand;
    let res: Stream;

    beforeAll(async () => {
      mockedS3Send = jest.fn(async () => Promise.resolve({ Body: {} }));

      const s3 = {
        send: mockedS3Send
      };

      const storage = new AwsFileStorage(
        s3 as unknown as S3Client,
        Bucket,
        undefined
      );

      res = await storage.load(Filename);
      s3SendCommand = mockedS3Send.mock.calls[0][0];
    });

    it('returns file', () => {
      expect(mockedS3Send).toHaveBeenCalled();
      expect(s3SendCommand).toBeInstanceOf(GetObjectCommand);
      expect(res).toBeDefined();
    });
  });
});
