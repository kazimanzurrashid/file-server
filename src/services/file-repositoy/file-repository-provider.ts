import { container } from 'tsyringe';
import { MongoClient } from 'mongodb';
import { Logger } from 'pino';

import config from '../../config';

import FileRepository, { FileInfo } from './file-repository';
import InMemoryFileRepository from './in-memory-file-repository';
import MongoDBFileRepository from './mongodb-file-repository';

export default function fileRepositoryProvider(): FileRepository {
  switch (config.db.provider.toLowerCase()) {
    case 'in-memory':
    case 'local': {
      return new InMemoryFileRepository();
    }
    case 'mongo':
    case 'mongodb': {
      const client = new MongoClient(config.db.mongodb.uri);
      const db = client.db();

      const collection = db.collection<FileInfo>(config.db.mongodb.collection);

      const ensureIndex = async (
        name: string,
        attr: string,
        ascending = true,
        unique = false
      ): Promise<void> => {
        const exists = await collection.indexExists(name);

        if (exists) {
          return;
        }

        await collection.createIndex(
          {
            [attr]: ascending ? 1 : -1
          },
          {
            name,
            unique
          }
        );
      };

      client.on('error', (error) => {
        if (container.isRegistered<Logger>('Logger')) {
          container
            .resolve<Logger>('Logger')
            .error(error, 'mongodb client error');
        }
      });

      // eslint-disable-next-line github/no-then
      client.connect().then(
        async () => {
          if (container.isRegistered<Logger>('Logger')) {
            container
              .resolve<Logger>('Logger')
              .info('mongodb client connected');
          }

          try {
            await db.createCollection(config.db.mongodb.collection);
          } catch (e) {
            // do nothing
          }

          await Promise.all([
            ensureIndex('ix_privateKey', 'privateKey', true, true),
            ensureIndex('ix_publicKey', 'publicKey', true, true),
            ensureIndex('ix_lastActivity', 'lastActivity', false, false)
          ]);
        },
        (reason) => {
          if (container.isRegistered<Logger>('Logger')) {
            container
              .resolve<Logger>('Logger')
              .error(reason, 'mongodb connection error');
          }
        }
      );

      container.registerInstance('mongoFiles', collection);

      return container.resolve(MongoDBFileRepository);
    }
    default: {
      throw new Error(
        `Unsupported file repository provider: "${config.db.provider}"!`
      );
    }
  }
}
