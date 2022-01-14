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

  describe('when provider is set to "google"', () => {
    let storage: IFileStorage;

    beforeAll(() => {
      config.storageProvider = 'google';
      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(GcpFileStorage);
    });
  });

  describe('when provider is set to "amazon"', () => {
    let storage: IFileStorage;

    beforeAll(() => {
      config.storageProvider = 'amazon';
      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(AwsFileStorage);
    });
  });

  describe('when provider is set to "microsoft"', () => {
    let storage: IFileStorage;

    beforeAll(() => {
      config.storageProvider = 'microsoft';
      storage = fileStorageProvider();
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(AzFileStorage);
    });
  });

  describe('when provider is set to anything unknown', () => {
    beforeAll(() => {
      config.storageProvider = 'ibm';
    });

    it('throws exception', () => {
      expect(() => fileStorageProvider()).toThrow();
    });
  });
});
