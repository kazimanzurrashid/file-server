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

  describe('local', () => {
    let originalPath: string;
    let storage: IFileStorage;

    beforeAll(() => {
      originalPath = config.storageFolder;
      config.storageFolder = '/storage';
      config.storageProvider = 'local';
      storage = fileStorageProvider();
    });

    afterAll(() => {
      config.storageFolder = originalPath;
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(LocalFileStorage);
    });
  });

  describe('gcp', () => {
    let storage: IFileStorage;

    beforeAll(() => {
      config.storageProvider = 'gcp';
      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(GcpFileStorage);
    });
  });

  describe('aws', () => {
    let storage: IFileStorage;

    beforeAll(() => {
      config.storageProvider = 'aws';
      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(AwsFileStorage);
    });
  });

  describe('az', () => {
    let storage: IFileStorage;

    beforeAll(() => {
      config.storageProvider = 'az';
      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(AzFileStorage);
    });
  });

  describe('unknown', () => {
    beforeAll(() => {
      config.storageProvider = 'foo-bar';
    });

    it('throws exception', () => {
      expect(() => fileStorageProvider()).toThrow();
    });
  });
});
