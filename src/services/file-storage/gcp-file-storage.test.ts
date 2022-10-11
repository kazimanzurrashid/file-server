import 'reflect-metadata';

import { Stream } from 'stream';

import { Storage } from '@google-cloud/storage';

import { Pipeable } from './file-storage';
import GcpFileStorage from './gcp-file-storage';

describe('GcpFileStorage', () => {
  const Bucket = 'my-bucket';
  const Filename = 'my-file.png';
  const FilePath = `/temp/${Filename}`;

  describe('put', () => {
    let mockedBucketUpload: jest.Mock;
    let path: string;

    beforeAll(async () => {
      mockedBucketUpload = jest.fn(async () => Promise.resolve());

      const client = {
        bucket: () => ({
          upload: mockedBucketUpload
        })
      };

      const storage = new GcpFileStorage(client as unknown as Storage, Bucket);

      path = await storage.put(FilePath);
    });

    it('uploads the file', () => {
      expect(mockedBucketUpload).toHaveBeenCalled();
    });

    it('returns the filename', () => {
      expect(path).toEqual(Filename);
    });
  });

  describe('delete', () => {
    let mockedFileDelete: jest.Mock;

    beforeAll(async () => {
      mockedFileDelete = jest.fn(async () => Promise.resolve());

      const client = {
        bucket: () => ({
          file: () => ({
            delete: mockedFileDelete
          })
        })
      };

      const storage = new GcpFileStorage(client as unknown as Storage, Bucket);

      await storage.delete(Filename);
    });

    it('deletes file', () => {
      expect(mockedFileDelete).toHaveBeenCalled();
    });
  });

  describe('load', () => {
    let mockedFileCreateReadStream: jest.Mock;
    let res: Pipeable;

    beforeAll(async () => {
      mockedFileCreateReadStream = jest.fn(async () =>
        Promise.resolve(new Stream())
      );

      const client = {
        bucket: () => ({
          file: () => ({
            createReadStream: mockedFileCreateReadStream
          })
        })
      };

      const storage = new GcpFileStorage(client as unknown as Storage, Bucket);

      res = await storage.load(Filename);
    });

    it('gets file file', () => {
      expect(mockedFileCreateReadStream).toHaveBeenCalled();
    });

    it('returns underlying stream', () => {
      expect(res).toBeDefined();
    });
  });
});
