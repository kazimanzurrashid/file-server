import type { DependencyContainer } from 'tsyringe';
import type { Collection, MongoClient } from 'mongodb';

import config from '../../config';

import FileRepository, { FileInfo } from './file-repository';
import InMemoryFileRepository from './in-memory-file-repository';
import MongoDBFileRepository from './mongodb-file-repository';

export default function fileRepositoryProvider(
  container: DependencyContainer
): FileRepository {
  switch (config.db.provider) {
    case 'in-memory': {
      return container.resolve(InMemoryFileRepository);
    }
    case 'mongo':
    case 'mongodb': {
      const client = container.resolve<(_: string) => MongoClient>(
        'mongoFactory'
      )(config.db.mongodb.uri);

      container.registerInstance<MongoClient>('mongoClient', client);

      const collection = client
        .db()
        .collection<FileInfo>(config.db.mongodb.collection);

      container.registerInstance<Collection<FileInfo>>(
        'mongoFilesCollection',
        collection
      );

      const ensureIndex = async (
        name: string,
        attr: string,
        ascending: boolean,
        unique: boolean
      ): Promise<void> => {
        const exists = await collection.indexExists(name);

        if (!exists) {
          await collection.createIndex(
            {
              [attr]: ascending ? 1 : -1
            },
            {
              name,
              unique
            }
          );
        }
      };

      // eslint-disable-next-line github/no-then
      client.connect().then(async () => {
        try {
          await client.db().createCollection(config.db.mongodb.collection);
        } catch (e) {
          // do nothing
        }

        await Promise.all([
          ensureIndex('ix_privateKey', 'privateKey', true, true),
          ensureIndex('ix_publicKey', 'publicKey', true, true),
          ensureIndex('ix_lastActivity', 'lastActivity', false, false)
        ]);
      });

      return container.resolve(MongoDBFileRepository);
    }
    default: {
      throw new Error(
        `Unsupported file repository provider: "${config.db.provider}"!`
      );
    }
  }
}
