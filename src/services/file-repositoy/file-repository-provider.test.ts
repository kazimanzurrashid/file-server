import 'reflect-metadata';

import config from '../../config';
import FileRepository from './file-repository';
import fileRepositoryProvider from './file-repository-provider';
import InMemoryFileRepository from './in-memory-file-repository';

describe('fileRepositoryProvider', () => {
  let originalProvider: string;

  beforeAll(() => {
    originalProvider = config.db.provider;
  });

  describe('in-memory', () => {
    let repository: FileRepository;

    beforeAll(() => {
      config.rateLimit.provider = 'in-memory';

      repository = fileRepositoryProvider();
    });

    it('returns correct limit', () => {
      expect(repository).toBeInstanceOf(InMemoryFileRepository);
    });
  });

  describe('unknown', () => {
    beforeAll(() => {
      config.db.provider = 'unknown';
    });

    it('throws exception', () => {
      expect(() => fileRepositoryProvider()).toThrow();
    });
  });

  afterAll(() => {
    config.rateLimit.provider = originalProvider;
  });
});
