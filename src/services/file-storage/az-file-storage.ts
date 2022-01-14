import { basename } from 'path';

import { injectable } from 'tsyringe';

import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient
} from '@azure/storage-blob';

import IFileStorage, { IPipeable } from './file-storage';

@injectable()
export default class AzFileStorage implements IFileStorage {
  private readonly container: ContainerClient;

  constructor(
    client: BlobServiceClient,
    containerName: string,
    private readonly fileDelete: (path: string) => Promise<void>
  ) {
    this.container = client.getContainerClient(containerName);
  }

  async put(sourcePath: string): Promise<string> {
    const filename = basename(sourcePath);

    const file = this.getFile(filename);

    await file.uploadFile(sourcePath);
    await this.fileDelete(sourcePath);

    return filename;
  }

  async delete(path: string): Promise<void> {
    const file = this.getFile(path);

    await file.delete();
  }

  async load(path: string): Promise<IPipeable> {
    const file = this.getFile(path);

    const { readableStreamBody } = await file.download();

    return Promise.resolve(readableStreamBody);
  }

  private getFile(path: string): BlockBlobClient {
    return this.container.getBlockBlobClient(path);
  }
}
