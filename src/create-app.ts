import { isAbsolute, join, resolve } from 'path';
import { copyFile, mkdirSync, statSync, unlink, createReadStream } from 'fs';
import { promisify } from 'util';

import { container } from 'tsyringe';
import express, { Application } from 'express';
import morgan from 'morgan';
import { Storage } from '@google-cloud/storage';
import { S3Client } from '@aws-sdk/client-s3';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  newPipeline
} from '@azure/storage-blob';

import config from './config';

import IFileStorage from './services/file-storage/file-storage';
import InMemoryRateLimit from './services/rate-limit/in-memory-rate-limit';
import InMemoryFileRepository from './services/file-repositoy/in-memory-file-repository';
import LocalFileStorage from './services/file-storage/local-file-storage';
import GcpFileStorage from './services/file-storage/gcp-file-storage';
import AwsFileStorage from './services/file-storage/aws-file-storage';
import AzFileStorage from './services/file-storage/az-file-storage';

import FilesController from './controllers/files-controller';
import filesRouter from './routers/files-router';

export default function createApp(): Application {
  (() => {
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

    container.register('RateLimit', {
      useValue: new InMemoryRateLimit({
        uploads: config.maxRateLimit.uploads,
        downloads: config.maxRateLimit.downloads
      })
    });

    container.register('FileRepository', {
      useValue: new InMemoryFileRepository()
    });

    const createFileStorage = (): IFileStorage => {
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
          // eslint-disable-next-line import/no-dynamic-require,@typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
          const opt = require(config.gcpConfigFile) as Record<string, string>;
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
    };

    container.register('FileStorage', {
      useValue: createFileStorage()
    });

    container.register('gcInactiveDuration', {
      useValue: config.garbageCollection.inactiveDuration
    });

    container.register('gcInterval', {
      useValue: config.garbageCollection.interval
    });
  })();

  const app = express();
  app.disable('x-powered-by');
  app.use(morgan('combined'));

  app.use('/files', filesRouter(container.resolve(FilesController)));
  app.get('/', (_, res) => {
    res.json({
      result: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  return app;
}
