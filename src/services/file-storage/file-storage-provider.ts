import { copyFile, createReadStream, mkdirSync, statSync, unlink } from 'fs';
import { isAbsolute, join, resolve } from 'path';
import { promisify } from 'util';

import { container } from 'tsyringe';

import { Storage } from '@google-cloud/storage';
import { S3Client } from '@aws-sdk/client-s3';
import {
  BlobServiceClient,
  newPipeline,
  StorageSharedKeyCredential
} from '@azure/storage-blob';

import config from '../../config';

import IFileStorage from './file-storage';
import LocalFileStorage from './local-file-storage';
import GcpFileStorage from './gcp-file-storage';
import AwsFileStorage from './aws-file-storage';
import AzFileStorage from './az-file-storage';

export default function fileStorageProvider(): IFileStorage {
  const ensureDir = (path: string): void => {
    const stat = statSync(path, { throwIfNoEntry: false });
    if (stat?.isDirectory()) {
      return;
    }
    mkdirSync(path);
  };

  const rootPath = resolve();

  ensureDir(join(rootPath, config.tempFolder));

  container.register('fsUnlink', {
    useValue: promisify(unlink)
  });

  container.register('fsCreateReadStream', {
    useValue: createReadStream
  });

  container.register('fsCopyFile', {
    useValue: promisify(copyFile)
  });

  switch (config.storageProvider.toLowerCase()) {
    case 'local': {
      let storagePath = join(rootPath, config.storageFolder);

      if (isAbsolute(config.storageProvider)) {
        storagePath = config.storageProvider;
      } else {
        storagePath = join(rootPath, config.storageFolder);
        ensureDir(storagePath);
      }

      container.register('localStorageLocation', { useValue: storagePath });

      return container.resolve(LocalFileStorage);
    }
    case 'gcp':
    case 'google': {
      const opt =
        config.gcpConfigFile &&
        statSync(config.gcpConfigFile, {
          throwIfNoEntry: false
        }).isFile()
          ? // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires,import/no-dynamic-require
            (require(config.gcpConfigFile) as Record<string, string>)
          : undefined;
      const client = new Storage(opt);

      container.register('storageClient', { useValue: client });
      container.register('gcpBucketName', { useValue: config.gcpBucket });

      return container.resolve(GcpFileStorage);
    }
    case 'aws':
    case 'amazon': {
      const client = new S3Client({ region: config.awsRegion });

      container.register('s3Client', { useValue: client });
      container.register('awsBucketName', { useValue: config.awsBucket });

      return container.resolve(AwsFileStorage);
    }
    case 'az':
    case 'azure':
    case 'microsoft': {
      const sharedKeyCredential = new StorageSharedKeyCredential(
        config.azStorageAccountName,
        config.azStorageAccountAccessKey
      );
      const pipeline = newPipeline(sharedKeyCredential);
      const client = new BlobServiceClient(
        `https://${config.azStorageAccountName}.blob.core.windows.net`,
        pipeline
      );

      container.register('blobClient', { useValue: client });
      container.register('azContainerName', {
        useValue: config.azContainerName
      });

      return container.resolve(AzFileStorage);
    }
    default: {
      throw new Error(
        `Unsupported file storage provider: "${config.storageProvider}"!`
      );
    }
  }
}
