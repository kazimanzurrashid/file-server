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
    originalProvider = config.storageProvider;
  });

  afterAll(() => {
    config.storageProvider = originalProvider;
  });

  describe('when provider is set to "local"', () => {
    let storage: IFileStorage;

    beforeAll(() => {
      config.storageProvider = 'local';
      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(LocalFileStorage);
    });
  });

  describe('when provider is set to "gcp"', () => {
    let storage: IFileStorage;

    beforeAll(() => {
      config.storageProvider = 'gcp';
      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(GcpFileStorage);
    });
  });

  describe('when provider is set to "aws"', () => {
    let storage: IFileStorage;

    beforeAll(() => {
      config.storageProvider = 'aws';
      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(AwsFileStorage);
    });
  });

  describe('when provider is set to "az"', () => {
    let storage: IFileStorage;

    beforeAll(() => {
      config.storageProvider = 'az';
      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(AzFileStorage);
    });
  });

  describe('when provider is set to anything unknown', () => {
    beforeAll(() => {
      config.storageProvider = 'foo-bar';
    });

    it('throws exception', () => {
      expect(() => fileStorageProvider()).toThrow();
    });
  });
});
