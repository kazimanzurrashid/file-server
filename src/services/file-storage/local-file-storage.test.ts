import 'reflect-metadata';

import { ReadStream } from 'fs';

import { IPipeable } from './file-storage';
import LocalFileStorage from './local-file-storage';

describe('LocalFileStorage', () => {
  const RootLocation = '/projects/file-server';
  const Filename = 'my-file.png';
  const FilePath = `/temp/${Filename}`;

  describe('#put', () => {
    let mockedFileCopy: jest.Mock;
    let mockedDelete: jest.Mock;
    let path: string;

    beforeAll(async () => {
      mockedDelete = jest.fn(async () => Promise.resolve());
      mockedFileCopy = jest.fn(async () => Promise.resolve());

      const storage = new LocalFileStorage(RootLocation, {
        delete: mockedDelete,
        copyFile: mockedFileCopy,
        createReadStream: () => undefined
      });

      path = await storage.put(FilePath);
    });

    it('copies the file', () => {
      expect(mockedFileCopy).toHaveBeenCalled();
    });

    it('deletes the source file', () => {
      expect(mockedDelete).toHaveBeenCalled();
    });

    it('returns the filename', () => {
      expect(path).toEqual(Filename);
    });
  });

  describe('#delete', () => {
    let mockedDelete: jest.Mock;

    beforeAll(async () => {
      mockedDelete = jest.fn(async () => Promise.resolve());
      const storage = new LocalFileStorage(RootLocation, {
        delete: mockedDelete,
        copyFile: () => undefined,
        createReadStream: () => undefined
      });

      await storage.delete(Filename);
    });

    it('deletes file from file system', () => {
      expect(mockedDelete).toHaveBeenCalled();
    });
  });

  describe('#load', () => {
    let res: IPipeable;

    beforeAll(async () => {
      const storage = new LocalFileStorage(RootLocation, {
        delete: () => undefined,
        copyFile: () => undefined,
        createReadStream: () => ({} as unknown as ReadStream)
      });

      res = await storage.load(Filename);
    });

    it('returns underlying stream', () => {
      expect(res).toBeDefined();
    });
  });
});
