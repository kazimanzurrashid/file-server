import 'reflect-metadata';

import { Collection } from 'mongodb';

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
        col as unknown as Collection<FileInfo>
      );

      await repo.add({
        publicKey: Key.generate(),
        privateKey: Key.generate(),
        path: 'test.png',
        size: 1000,
        mimeType: 'image/png'
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
        col as unknown as Collection<FileInfo>
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
        col as unknown as Collection<FileInfo>
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
        col as unknown as Collection<FileInfo>
      );

      await repo.listInactiveSince(new Date());
    });

    it('delegates to collection find', () => {
      expect(mockedFind).toHaveBeenCalled();
    });
  });
});
