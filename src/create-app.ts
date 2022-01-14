import { container } from 'tsyringe';
import express, { Express } from 'express';
import morgan from 'morgan';

import config from './config';

import InMemoryRateLimit from './services/rate-limit/in-memory-rate-limit';
import InMemoryFileRepository from './services/file-repositoy/in-memory-file-repository';
import fileStorageProvider from './services/file-storage/file-storage-provider';

import FilesController from './controllers/files-controller';
import filesRouter from './routers/files-router';

export default function createApp(): Express {
  (() => {
    container.register('RateLimit', {
      useValue: new InMemoryRateLimit({
        uploads: config.maxRateLimit.uploads,
        downloads: config.maxRateLimit.downloads
      })
    });

    container.register('FileRepository', {
      useValue: new InMemoryFileRepository()
    });

    container.register('FileStorage', {
      useValue: fileStorageProvider()
    });

    container.register('gcInactiveDuration', {
      useValue: config.garbageCollection.inactiveDuration
    });

    container.register('gcInterval', {
      useValue: config.garbageCollection.interval
    });
  })();

  return express()
    .disable('x-powered-by')
    .use(morgan('combined'))
    .use('/files', filesRouter(container.resolve(FilesController)));
}
