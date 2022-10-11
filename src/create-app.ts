import { extname } from 'path';

import express, { Express, Response } from 'express';
import multer from 'multer';
import { container } from 'tsyringe';
import Pino, { Logger } from 'pino';
import parse from 'parse-duration';

import config from './config';
import key from './lib/key';

import IFileRepository from './services/file-repositoy/file-repository';
import IFileStorage from './services/file-storage/file-storage';

import InMemoryFileRepository from './services/file-repositoy/in-memory-file-repository';
import rateLimitProvider from './services/rate-limit/rate-limit-provider';
import fileStorageProvider from './services/file-storage/file-storage-provider';

import FilesController from './controllers/files-controller';
import filesRouter from './routers/files-router';
import openApiRouter from './routers/open-api-router';
import IRateLimit from './services/rate-limit/rate-limit';

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

    container.registerInstance('multer', uploader);

    container.register<IRateLimit>('RateLimit', {
      useFactory: rateLimitProvider
    });

    container.register<IFileRepository>('FileRepository', {
      useFactory: () => new InMemoryFileRepository()
    });

    container.register<IFileStorage>('FileStorage', {
      useFactory: fileStorageProvider
    });

    container.registerInstance(
      'gcInactiveDuration',
      parse(config.garbageCollection.inactiveDuration)
    );
    container.registerInstance(
      'gcCronExpression',
      config.garbageCollection.cronExpression
    );

    container.registerInstance('Logger', Pino());
  })();

  return express()
    .disable('x-powered-by')
    .disable('etag')
    .use(
      // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
      require('express-pino-logger')({
        logger: container.resolve<Logger>('Logger')
      })
    )
    .use(express.json())
    .use(
      '/files',
      filesRouter(
        container.resolve(FilesController),
        container.resolve('multer')
      )
    )
    .use('/', openApiRouter())
    .all('*', (_, res: Response) => {
      res.status(404).json({
        error: 'Resource not found'
      });
    });
}
