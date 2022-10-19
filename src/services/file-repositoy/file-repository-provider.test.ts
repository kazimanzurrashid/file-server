import 'reflect-metadata';

import { container } from 'tsyringe';

import type { MongoClient } from 'mongodb';

import config from '../../config';
import type FileRepository from './file-repository';
import fileRepositoryProvider from './file-repository-provider';
import InMemoryFileRepository from './in-memory-file-repository';
import MongoDBFileRepository from './mongodb-file-repository';

describe('fileRepositoryProvider', () => {
  let originalProvider: string;

  beforeAll(() => {
    originalProvider = config.db.provider;
  });

  describe('in-memory', () => {
    let repository: FileRepository;

    beforeAll(() => {
      config.db.provider = 'in-memory';

      repository = fileRepositoryProvider(container);
    });

    it('returns correct repository', () => {
      expect(repository).toBeInstanceOf(InMemoryFileRepository);
    });
  });

  describe('mongodb', () => {
    describe('success', () => {
      let mockedCreateCollection: jest.Mock;
      let mockedCreateIndex: jest.Mock;

      let repository: FileRepository;

      beforeAll(() => {
        config.db.provider = 'mongodb';

        const mockedConnect = jest.fn(async () => Promise.resolve());

        mockedCreateCollection = jest.fn(async () => Promise.resolve());
        mockedCreateIndex = jest.fn(async () => Promise.resolve());

        container.registerInstance<(_: string) => MongoClient>(
          'mongoFactory',
          () => {
            return {
              db: () => ({
                createCollection: mockedCreateCollection,
                collection: () => ({
                  indexExists: async () => Promise.resolve(false),
                  createIndex: mockedCreateIndex
                })
              }),
              connect: mockedConnect
            } as unknown as MongoClient;
          }
        );

        repository = fileRepositoryProvider(container);
      });

      it('returns correct repository', () => {
        expect(repository).toBeInstanceOf(MongoDBFileRepository);
      });

      it('creates collection', () => {
        expect(mockedCreateCollection).toHaveBeenCalled();
      });

      it('creates indexes', () => {
        expect(mockedCreateIndex).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('unknown', () => {
    beforeAll(() => {
      config.db.provider = 'unknown';
    });

    it('throws exception', () => {
      expect(() => fileRepositoryProvider(container)).toThrow();
    });
  });

  afterAll(() => {
    config.db.provider = originalProvider;
  });
});
