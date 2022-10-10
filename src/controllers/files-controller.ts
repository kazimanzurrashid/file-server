import { inject, injectable } from 'tsyringe';
import type { Request, Response } from 'express';

import key from '../lib/key';
import IRateLimit from '../services/rate-limit/rate-limit';
import IFileRepository from '../services/file-repositoy/file-repository';
import IFileStorage from '../services/file-storage/file-storage';

@injectable()
export default class FilesController {
  constructor(
    @inject('RateLimit') private readonly rateLimit: IRateLimit,
    @inject('FileRepository') private readonly repository: IFileRepository,
    @inject('FileStorage') private readonly storage: IFileStorage,
    @inject('fsUnlink')
    private readonly fileDelete: (path: string) => Promise<void>
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const file = req.file;

    if (!file) {
      res.status(422).json({
        error: 'File is required!'
      });
      return;
    }

    const canUpload = await this.rateLimit.canUpload(req.ip);

    if (!canUpload) {
      await this.fileDelete(file.path);
      res.status(429).json({
        error: 'You have already reached your daily upload limit!'
      });
      return;
    }

    const path = await this.storage.put(file.path);

    const publicKey = key.generate();
    const privateKey = key.generate();

    await this.repository.add({
      publicKey,
      privateKey,
      path,
      mimeType: file.mimetype,
      size: file.size
    });

    await Promise.all([
      this.rateLimit.recordUpload(req.ip),
      this.fileDelete(file.path)
    ]);

    res.status(201).json({
      publicKey,
      privateKey
    });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const info = await this.repository.delete(req.params.privateKey);

    if (!info) {
      res.status(404).json({
        error: 'File does not exist!'
      });
      return;
    }

    await this.storage.delete(info.path);

    res.status(204).end();
  }

  async get(req: Request, res: Response): Promise<void> {
    const info = await this.repository.get(req.params.publicKey);

    if (!info) {
      res.status(404).json({
        error: 'File does not exist!'
      });
      return;
    }

    const canDownload = await this.rateLimit.canDownload(req.ip);

    if (!canDownload) {
      res.status(429).json({
        error: 'You have already reached your daily download limit!'
      });
      return;
    }

    res.once('finish', async () => {
      await this.rateLimit.recordDownload(req.ip);
    });

    res.status(200).contentType(info.mimeType);

    const content = await this.storage.load(info.path);

    content.pipe(res);
  }
}
