import { inject, injectable } from 'tsyringe';
import { Collection } from 'mongodb';

import clock from '../../lib/clock';
import FileRepository, { AddFileInfo, FileInfo } from './file-repository';

@injectable()
export default class MongoDBFileRepository implements FileRepository {
  constructor(
    @inject('mongoFiles')
    private readonly collection: Collection<FileInfo>
  ) {}

  async add(arg: AddFileInfo): Promise<void> {
    await this.collection.insertOne({ ...arg, lastActivity: clock.now() });
  }

  async delete(privateKey: string): Promise<FileInfo | undefined> {
    const res = await this.collection.findOneAndDelete({ privateKey });

    return res.value;
  }

  async get(publicKey: string): Promise<FileInfo | undefined> {
    const res = await this.collection.findOneAndUpdate(
      { publicKey },
      {
        $set: {
          lastActivity: clock.now()
        }
      }
    );

    return res.value;
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
}
