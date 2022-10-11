import 'reflect-metadata';

import config from '../../config';

import IFileStorage from './file-storage';
import fileStorageProvider from './file-storage-provider';
import LocalFileStorage from './local-file-storage';
import GcpFileStorage from './gcp-file-storage';
import AwsFileStorage from './aws-file-storage';
import AzFileStorage from './az-file-storage';

describe('fileStorageProvider', () => {
  let originalProvider: string;

  beforeAll(() => {
    originalProvider = config.storage.provider;
  });

  describe('local', () => {
    let originalPath: string;
    let storage: IFileStorage;

    beforeAll(() => {
      originalPath = config.storage.local.location;

      config.storage.provider = 'local';
      config.storage.local.location = '/storage';

      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(LocalFileStorage);
    });

    afterAll(() => {
      config.storage.local.location = originalPath;
    });
  });

  describe('gcp', () => {
    let storage: IFileStorage;

    beforeAll(() => {
      config.storage.provider = 'gcp';
      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(GcpFileStorage);
    });
  });

  describe('aws', () => {
    let storage: IFileStorage;

    beforeAll(() => {
      config.storage.provider = 'aws';
      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(AwsFileStorage);
    });
  });

  describe('az', () => {
    let storage: IFileStorage;

    beforeAll(() => {
      config.storage.provider = 'az';
      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(AzFileStorage);
    });
  });

  describe('unknown', () => {
    beforeAll(() => {
      config.storage.provider = 'foo-bar';
    });

    it('throws exception', () => {
      expect(() => fileStorageProvider()).toThrow();
    });
  });

  afterAll(() => {
    config.storage.provider = originalProvider;
  });
});
