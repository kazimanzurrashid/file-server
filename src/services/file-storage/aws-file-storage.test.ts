import 'reflect-metadata';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';

import { IPipeable } from './file-storage';
import AwsFileStorage from './aws-file-storage';

describe('AwsFileStorage', () => {
  const Bucket = 'my-bucket';
  const Filename = 'my-file.png';
  const FilePath = `/temp/${Filename}`;

  describe('#put', () => {
    let mockedFileCreateReadStream: jest.Mock;
    let mockedS3Send: jest.Mock;
    let s3SendCommand;

    let path: string;

    beforeAll(async () => {
      mockedFileCreateReadStream = jest.fn(async () => Promise.resolve({}));

      mockedS3Send = jest.fn(async () => Promise.resolve());

      const s3 = {
        send: mockedS3Send
      };

      const storage = new AwsFileStorage(
        s3 as unknown as S3Client,
        Bucket,
        mockedFileCreateReadStream
      );

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
    let res: IPipeable;

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

    it('gets file file', () => {
      expect(mockedS3Send).toHaveBeenCalled();
      expect(s3SendCommand).toBeInstanceOf(GetObjectCommand);
    });

    it('returns file', () => {
      expect(res).toBeDefined();
    });
  });
});
