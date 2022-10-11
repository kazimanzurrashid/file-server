import { createReadStream, mkdirSync, statSync } from 'fs';

import { copyFile, unlink } from 'fs/promises';

import { isAbsolute, join, resolve } from 'path';

import { container } from 'tsyringe';

import { Storage } from '@google-cloud/storage';
import { S3Client } from '@aws-sdk/client-s3';
import {
  BlobServiceClient,
  newPipeline,
  StorageSharedKeyCredential
} from '@azure/storage-blob';

import config from '../../config';

import FileStorage from './file-storage';
import LocalFileStorage from './local-file-storage';
import GcpFileStorage from './gcp-file-storage';
import AwsFileStorage from './aws-file-storage';
import AzFileStorage from './az-file-storage';

export default function fileStorageProvider(): FileStorage {
  const ensureDir = (path: string): void => {
    const stat = statSync(path, { throwIfNoEntry: false });
    if (stat?.isDirectory()) {
      return;
    }
    mkdirSync(path);
  };

  const rootPath = resolve();

  if (!isAbsolute(config.storage.tempLocation)) {
    ensureDir(join(rootPath, config.storage.tempLocation));
  }

  container.registerInstance('fsUnlink', unlink);

  container.registerInstance('fsCreateReadStream', createReadStream);

  container.registerInstance('fsCopyFile', copyFile);

  switch (config.storage.provider.toLowerCase()) {
    case 'local': {
      let storagePath: string;

      if (isAbsolute(config.storage.local.location)) {
        storagePath = config.storage.local.location;
      } else {
        storagePath = join(rootPath, config.storage.local.location);
        ensureDir(storagePath);
      }

      container.registerInstance('localStorageLocation', storagePath);

      return container.resolve(LocalFileStorage);
    }
    case 'gcp':
    case 'google': {
      const client = new Storage({
        keyFilename: config.storage.gcp.keyFileLocation
      });
      container.registerInstance('storageClient', client);
      container.registerInstance('gcpBucketName', config.storage.gcp.bucket);

      return container.resolve(GcpFileStorage);
    }
    case 'aws':
    case 'amazon': {
      const client = new S3Client({
        region: config.storage.aws.region,
        credentials: {
          accessKeyId: config.storage.aws.accessKeyId,
          secretAccessKey: config.storage.aws.secretAccessKey
        }
      });

      container.registerInstance('s3Client', client);
      container.registerInstance('awsBucketName', config.storage.aws.bucket);

      return container.resolve(AwsFileStorage);
    }
    case 'az':
    case 'azure':
    case 'microsoft': {
      const sharedKeyCredential = new StorageSharedKeyCredential(
        config.storage.az.storageAccountName,
        config.storage.az.storageAccountAccessKey
      );
      const pipeline = newPipeline(sharedKeyCredential);
      const client = new BlobServiceClient(
        `https://${config.storage.az.storageAccountName}.blob.core.windows.net`,
        pipeline
      );

      container.registerInstance('blobClient', client);
      container.registerInstance(
        'azContainerName',
        config.storage.az.storageContainerName
      );

      return container.resolve(AzFileStorage);
    }
    default: {
      throw new Error(
        `Unsupported file storage provider: "${config.storage.provider}"!`
      );
    }
  }
}
