import { extname } from 'path';

import { container } from 'tsyringe';
import express, { Express } from 'express';
import morgan from 'morgan';
import multer from 'multer';
import parse from 'parse-duration';

import config from './config';
import key from './lib/key';

import InMemoryRateLimit from './services/rate-limit/in-memory-rate-limit';
import InMemoryFileRepository from './services/file-repositoy/in-memory-file-repository';
import fileStorageProvider from './services/file-storage/file-storage-provider';

import FilesController from './controllers/files-controller';
import filesRouter from './routers/files-router';
import openApiRouter from './routers/open-api-router';

export default function createApp(): Express {
  (() => {
    const storage = multer.diskStorage({
      destination: (
        _,
        __,
        cb: (err: Error | null, destination: string) => void
      ) => {
        cb(null, `${config.tempFolder}/`);
      },

      filename: (
        _,
        file,
        cb: (err: Error | null, filename: string) => void
      ) => {
        const filename = `${key.generate()}${extname(file.originalname)}`;
        cb(null, filename);
      }
    });

    const uploader = multer({
      storage
    }).single('file');

    container.register('multer', {
      useValue: uploader
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

    container.register('FileStorage', {
      useValue: fileStorageProvider()
    });

    container.register('gcInactiveDuration', {
      useValue: parse(config.garbageCollection.inactiveDuration)
    });

    container.register('gcCronExpression', {
      useValue: config.garbageCollection.cronExpression
    });
  })();

  return express()
    .disable('x-powered-by')
    .use(morgan('combined'))
    .use(
      '/files',
      filesRouter(
        container.resolve(FilesController),
        container.resolve('multer')
      )
    )
    .use('/', openApiRouter());
}
