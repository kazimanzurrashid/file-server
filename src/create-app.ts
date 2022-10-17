import { extname } from 'path';

import express, { Express, Response } from 'express';
import multer from 'multer';
import { container } from 'tsyringe';
import parse from 'parse-duration';
import Pino, { Logger } from 'pino';
import { MongoClient } from 'mongodb';
import {
  createClient,
  RedisClientOptions,
  RedisClientType
} from '@redis/client';

import config from './config';
import key from './lib/key';

import type RateLimit from './services/rate-limit/rate-limit';
import rateLimitProvider from './services/rate-limit/rate-limit-provider';
import type FileRepository from './services/file-repositoy/file-repository';
import fileRepositoryProvider from './services/file-repositoy/file-repository-provider';
import type FileStorage from './services/file-storage/file-storage';
import fileStorageProvider from './services/file-storage/file-storage-provider';

import filesRouter from './routers/files-router';
import FilesController from './controllers/files-controller';

import healthRouter from './routers/health-router';
import HealthController from './controllers/health-controller';

import openApiRouter from './routers/open-api-router';

export default function createApp(): Express {
  (() => {
    const storage = multer.diskStorage({
      destination: (
        _,
        __,
        cb: (err: Error | null, destination: string) => void
      ) => {
        cb(null, `${config.storage.tempLocation}/`);
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

    container.register<RateLimit>('RateLimit', {
      useFactory: rateLimitProvider
    });

    container.register<FileRepository>('FileRepository', {
      useFactory: fileRepositoryProvider
    });

    container.register<FileStorage>('FileStorage', {
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

    container.registerInstance<Logger>(
      'Logger',
      Pino({
        timestamp: Pino.stdTimeFunctions.isoTime,
        formatters: {
          level: (label) => {
            return {
              level: label
            };
          }
        }
      })
    );

    container.registerInstance<(_: string) => MongoClient>(
      'mongoFactory',
      (uri: string): MongoClient => {
        return new MongoClient(uri);
      }
    );

    container.registerInstance<(_: RedisClientOptions) => RedisClientType>(
      'redisFactory',
      (opt: RedisClientOptions): RedisClientType => {
        return createClient(opt) as RedisClientType;
      }
    );
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
    .use('/health', healthRouter(container.resolve(HealthController)))
    .use('/', openApiRouter())
    .all('*', (_, res: Response) => {
      res.status(404).json({
        error: 'Resource not found'
      });
    });
}
