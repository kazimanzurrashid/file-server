import { inject, singleton } from 'tsyringe';
import { Collection, MongoClient } from 'mongodb';

import clock from '../../lib/clock';
import FileRepository, { AddFileInfo, FileInfo } from './file-repository';

@singleton()
export default class MongoDBFileRepository implements FileRepository {
  constructor(
    @inject('mongoFilesCollection')
    private readonly collection: Collection<FileInfo>,
    @inject('mongoClient')
    private readonly client: MongoClient
  ) {}

  async add(arg: AddFileInfo): Promise<void> {
    await this.collection.insertOne({ ...arg, lastActivity: clock.now() });
  }

  async delete(privateKey: string): Promise<FileInfo | undefined> {
    return await this.collection.findOneAndDelete({ privateKey });
  }

  async get(publicKey: string): Promise<FileInfo | undefined> {
    return await this.collection.findOneAndUpdate(
      { publicKey },
      {
        $set: {
          lastActivity: clock.now()
        }
      }
    );
  }

  async listInactiveSince(timestamp: Date, max = 25): Promise<FileInfo[]> {
    return this.collection
      .find(
        {
          lastActivity: {
            $lte: timestamp
          }
        },
        {
          limit: max
        }
      )
      .toArray();
  }

  async isLive(): Promise<boolean> {
    try {
      await this.client.db().command({ ping: 1 });

      return true;
    } catch (e) {
      return false;
    }
  }
}
