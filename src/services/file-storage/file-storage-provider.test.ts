import 'reflect-metadata';

import { container } from 'tsyringe';

import config from '../../config';
import type FileStorage from './file-storage';
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
    let storage: FileStorage;

    beforeAll(() => {
      originalPath = config.storage.local.location;

      config.storage.provider = 'local';
      config.storage.local.location = '/storage';

      storage = fileStorageProvider(container);
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(LocalFileStorage);
    });

    afterAll(() => {
      config.storage.local.location = originalPath;
    });
  });

  describe('gcp', () => {
    let storage: FileStorage;

    beforeAll(() => {
      config.storage.provider = 'gcp';
      storage = fileStorageProvider(container);
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(GcpFileStorage);
    });
  });

  describe('aws', () => {
    let storage: FileStorage;

    beforeAll(() => {
      config.storage.provider = 'aws';
      storage = fileStorageProvider(container);
    });

    it('returns correct storage', () => {
      expect(storage).toBeInstanceOf(AwsFileStorage);
    });
  });

  describe('az', () => {
    let storage: FileStorage;

    beforeAll(() => {
      config.storage.provider = 'az';
      storage = fileStorageProvider(container);
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
      expect(() => fileStorageProvider(container)).toThrow();
    });
  });

  afterAll(() => {
    config.storage.provider = originalProvider;
  });
});
