import { isAbsolute, join, resolve } from 'path';
import { copyFile, mkdirSync, statSync, unlink, createReadStream } from 'fs';
import { promisify } from 'util';

import { container } from 'tsyringe';
import express, { Application } from 'express';
import morgan from 'morgan';
import { Storage } from '@google-cloud/storage';
import { S3Client } from '@aws-sdk/client-s3';

import config from './config';

import IFileStorage from './services/file-storage/file-storage';
import InMemoryRateLimit from './services/rate-limit/in-memory-rate-limit';
import InMemoryFileRepository from './services/file-repositoy/in-memory-file-repository';
import LocalFileStorage from './services/file-storage/local-file-storage';
import GcpFileStorage from './services/file-storage/gcp-file-storage';
import AwsFileStorage from './services/file-storage/aws-file-storage';

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
      const fileDelete = promisify(unlink);

      switch (config.storageProvider.toLowerCase()) {
        case 'local': {
          let storagePath = join(rootPath, config.storageFolder);

          if (isAbsolute(config.storageProvider)) {
            storagePath = config.storageProvider;
          } else {
            storagePath = join(rootPath, config.storageFolder);
            ensureDir(storagePath);
          }

          return new LocalFileStorage(storagePath, {
            delete: fileDelete,
            copyFile: promisify(copyFile),
            createReadStream
          });
        }
        case 'gcp':
        case 'google': {
          // eslint-disable-next-line import/no-dynamic-require,@typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
          const opt = require(config.gcpConfigFile) as Record<string, string>;

          return new GcpFileStorage(
            new Storage(opt),
            config.gcpBucket,
            fileDelete
          );
        }
        case 'aws':
        case 'amazon': {
          return new AwsFileStorage(
            new S3Client({ region: config.awsRegion }),
            config.awsBucket,
            {
              delete: fileDelete,
              createReadStream
            }
          );
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
