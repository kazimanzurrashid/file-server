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

  container.registerInstance('fsUnlink', unlink);

  container.registerInstance('fsCreateReadStream', createReadStream);

  container.registerInstance('fsCopyFile', copyFile);

  switch (config.storageProvider.toLowerCase()) {
    case 'local': {
      let storagePath: string;

      if (isAbsolute(config.storageFolder)) {
        storagePath = config.storageFolder;
      } else {
        storagePath = join(rootPath, config.storageFolder);
        ensureDir(storagePath);
      }

      container.registerInstance('localStorageLocation', storagePath);

      return container.resolve(LocalFileStorage);
    }
    case 'gcp':
    case 'google': {
      const client = new Storage({
        keyFilename: config.gcpKeyFileLocation
      });
      container.registerInstance('storageClient', client);
      container.registerInstance('gcpBucketName', config.gcpBucket);

      return container.resolve(GcpFileStorage);
    }
    case 'aws':
    case 'amazon': {
      const client = new S3Client({ region: config.awsRegion });

      container.registerInstance('s3Client', client);
      container.registerInstance('awsBucketName', config.awsBucket);

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

      container.registerInstance('blobClient', client);
      container.registerInstance('azContainerName', config.azContainerName);

      return container.resolve(AzFileStorage);
    }
    default: {
      throw new Error(
        `Unsupported file storage provider: "${config.storageProvider}"!`
      );
    }
  }
}
