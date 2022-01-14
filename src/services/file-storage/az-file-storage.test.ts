import 'reflect-metadata';
import { Stream } from 'stream';

import { BlobServiceClient } from '@azure/storage-blob';

import { IPipeable } from './file-storage';
import AzFileStorage from './az-file-storage';

describe('AzFileStorage', () => {
  const Container = 'my-container';
  const Filename = 'my-file.png';
  const FilePath = `/temp/${Filename}`;

  describe('#put', () => {
    let mockedClientFileUpload: jest.Mock;
    let mockedFileDelete: jest.Mock;
    let path: string;

    beforeAll(async () => {
      mockedClientFileUpload = jest.fn(async () => Promise.resolve());

      // noinspection JSUnusedGlobalSymbols
      const client = {
        getContainerClient: () => ({
          getBlockBlobClient: () => ({
            uploadFile: mockedClientFileUpload
          })
        })
      };

      mockedFileDelete = jest.fn(async () => Promise.resolve());

      const storage = new AzFileStorage(
        client as unknown as BlobServiceClient,
        Container,
        mockedFileDelete
      );

      path = await storage.put(FilePath);
    });

    it('uploads the file', () => {
      expect(mockedClientFileUpload).toHaveBeenCalled();
    });

    it('deletes the source file', () => {
      expect(mockedFileDelete).toHaveBeenCalled();
    });

    it('returns the filename', () => {
      expect(path).toEqual(Filename);
    });
  });

  describe('#delete', () => {
    let mockedClientFileDelete: jest.Mock;

    beforeAll(async () => {
      mockedClientFileDelete = jest.fn(async () => Promise.resolve());

      // noinspection JSUnusedGlobalSymbols
      const client = {
        getContainerClient: () => ({
          getBlockBlobClient: () => ({
            delete: mockedClientFileDelete
          })
        })
      };

      const storage = new AzFileStorage(
        client as unknown as BlobServiceClient,
        Container,
        undefined
      );

      await storage.delete(Filename);
    });

    it('deletes file', () => {
      expect(mockedClientFileDelete).toHaveBeenCalled();
    });
  });

  describe('#load', () => {
    let mockedClientFileDownload: jest.Mock;
    let res: IPipeable;

    beforeAll(async () => {
      mockedClientFileDownload = jest.fn(async () =>
        Promise.resolve({ readableStreamBody: new Stream() })
      );

      // noinspection JSUnusedGlobalSymbols
      const client = {
        getContainerClient: () => ({
          getBlockBlobClient: () => ({
            download: mockedClientFileDownload
          })
        })
      };

      const storage = new AzFileStorage(
        client as unknown as BlobServiceClient,
        Container,
        undefined
      );

      res = await storage.load(Filename);
    });

    it('gets file file', () => {
      expect(mockedClientFileDownload).toHaveBeenCalled();
    });

    it('returns underlying stream', () => {
      expect(res).toBeDefined();
    });
  });
});
