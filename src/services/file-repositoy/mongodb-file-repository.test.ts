import 'reflect-metadata';

import { Collection, MongoClient } from 'mongodb';

import Key from '../../lib/key';

import { FileInfo } from './file-repository';
import MongoDBFileRepository from './mongodb-file-repository';

describe('MongoDBFileRepository', () => {
  describe('add', () => {
    let mockedInsertOne: jest.Mock;

    beforeAll(async () => {
      mockedInsertOne = jest.fn(async () => Promise.resolve());

      const col = {
        insertOne: mockedInsertOne
      };

      const repo = new MongoDBFileRepository(
        col as unknown as Collection<FileInfo>,
        {} as unknown as MongoClient
      );

      await repo.add({
        publicKey: Key.generate(),
        privateKey: Key.generate(),
        path: 'a1f1457845cf420c883d46abc5a5c844.png',
        size: 1000,
        mimeType: 'image/png',
        originalName: 'my_photo.png'
      });
    });

    it('delegates to collection insertOne', () => {
      expect(mockedInsertOne).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    let mockedFindOneAndDelete: jest.Mock;

    beforeAll(async () => {
      mockedFindOneAndDelete = jest.fn(async () =>
        Promise.resolve({ value: {} })
      );

      const col = {
        findOneAndDelete: mockedFindOneAndDelete
      };

      const repo = new MongoDBFileRepository(
        col as unknown as Collection<FileInfo>,
        {} as unknown as MongoClient
      );

      await repo.delete(Key.generate());
    });

    it('delegates to collection findOneAndDelete', () => {
      expect(mockedFindOneAndDelete).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    let mockedFindOneAndUpdate: jest.Mock;

    beforeAll(async () => {
      mockedFindOneAndUpdate = jest.fn(async () =>
        Promise.resolve({ value: {} })
      );

      const col = {
        findOneAndUpdate: mockedFindOneAndUpdate
      };

      const repo = new MongoDBFileRepository(
        col as unknown as Collection<FileInfo>,
        {} as unknown as MongoClient
      );

      await repo.get(Key.generate());
    });

    it('delegates to collection findOneAndUpdate', () => {
      expect(mockedFindOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('listInactiveSince', () => {
    let mockedFind: jest.Mock;

    beforeAll(async () => {
      mockedFind = jest.fn(() => ({
        toArray: () => jest.fn(async () => Promise.resolve())
      }));

      const col = {
        find: mockedFind
      };

      const repo = new MongoDBFileRepository(
        col as unknown as Collection<FileInfo>,
        {} as unknown as MongoClient
      );

      await repo.listInactiveSince(new Date());
    });

    it('delegates to collection find', () => {
      expect(mockedFind).toHaveBeenCalled();
    });
  });

  describe('isLive', () => {
    describe('when alive', () => {
      let res: boolean;

      beforeAll(async () => {
        const repo = new MongoDBFileRepository(
          {} as unknown as Collection<FileInfo>,
          {
            db: () => ({
              command: jest.fn(async () => Promise.resolve())
            })
          } as unknown as MongoClient
        );

        res = await repo.isLive();
      });

      it('returns true', () => {
        expect(res).toEqual(true);
      });
    });

    describe('when down', () => {
      let res: boolean;

      beforeAll(async () => {
        const repo = new MongoDBFileRepository(
          {} as unknown as Collection<FileInfo>,
          {
            db: () => ({
              command: jest.fn(async () => Promise.reject(new Error()))
            })
          } as unknown as MongoClient
        );

        res = await repo.isLive();
      });

      it('returns false', () => {
        expect(res).toEqual(false);
      });
    });
  });
});
