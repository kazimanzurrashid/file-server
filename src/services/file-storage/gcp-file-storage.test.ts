import 'reflect-metadata';

import { Storage } from '@google-cloud/storage';

import GcpFileStorage from './gcp-file-storage';
import { Stream } from 'stream';

describe('GcpFileStorage', () => {
  const Bucket = 'my-bucket';
  const Filename = 'my-file.png';
  const FilePath = `/temp/${Filename}`;

  describe('#put', () => {
    let mockedBucket: jest.Mock;
    let mockedBucketUpload: jest.Mock;
    let mockedFileDelete: jest.Mock;
    let path: string;

    beforeAll(async () => {
      mockedBucketUpload = jest.fn(async () => Promise.resolve());
      mockedBucket = jest.fn(() => ({
        upload: mockedBucketUpload
      }));
      mockedFileDelete = jest.fn(async () => Promise.resolve());

      const storage = new GcpFileStorage(
        { bucket: mockedBucket } as unknown as Storage,
        Bucket,
        mockedFileDelete
      );

      path = await storage.put(FilePath);
    });

    it('uploads the file', () => {
      expect(mockedBucketUpload).toHaveBeenCalled();
    });

    it('deletes the source file', () => {
      expect(mockedFileDelete).toHaveBeenCalled();
    });

    it('returns the filename', () => {
      expect(path).toEqual(Filename);
    });
  });

  describe('#delete', () => {
    let mockedBucket: jest.Mock;
    let mockedFile: jest.Mock;
    let mockedFileDelete: jest.Mock;

    beforeAll(async () => {
      mockedFileDelete = jest.fn(async () => Promise.resolve());
      mockedFile = jest.fn(() => ({ delete: mockedFileDelete }));
      mockedBucket = jest.fn(() => ({
        file: mockedFile
      }));

      const storage = new GcpFileStorage(
        { bucket: mockedBucket } as unknown as Storage,
        Bucket,
        undefined
      );

      await storage.delete(Filename);
    });

    it('deletes file', () => {
      expect(mockedFileDelete).toHaveBeenCalled();
    });
  });

  describe('#load', () => {
    let res: Stream;

    beforeAll(async () => {
      const mockedFile = jest.fn(() => ({
        createReadStream: () => new Stream()
      }));
      const mockedBucket = jest.fn(() => ({
        file: mockedFile
      }));

      const storage = new GcpFileStorage(
        { bucket: mockedBucket } as unknown as Storage,
        Bucket,
        undefined
      );

      res = await storage.load(Filename);
    });

    it('returns underlying stream', () => {
      expect(res).toBeDefined();
    });
  });
});
