import { basename } from 'path';

import { inject, injectable } from 'tsyringe';

import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient
} from '@azure/storage-blob';

import FileStorage, { Pipeable } from './file-storage';

@injectable()
export default class AzFileStorage implements FileStorage {
  private readonly container: ContainerClient;

  constructor(
    @inject('blobClient')
    client: BlobServiceClient,
    @inject('azContainerName')
    containerName: string
  ) {
    this.container = client.getContainerClient(containerName);
  }

  async put(sourcePath: string): Promise<string> {
    const filename = basename(sourcePath);

    const file = this.getFile(filename);

    await file.uploadFile(sourcePath);

    return filename;
  }

  async delete(path: string): Promise<void> {
    const file = this.getFile(path);

    await file.delete();
  }

  async load(path: string): Promise<Pipeable> {
    const file = this.getFile(path);

    const { readableStreamBody } = await file.download();

    return readableStreamBody;
  }

  async isLive(): Promise<boolean> {
    try {
      return await this.container.exists();
    } catch (e) {
      return false;
    }
  }

  private getFile(path: string): BlockBlobClient {
    return this.container.getBlockBlobClient(path);
  }
}
