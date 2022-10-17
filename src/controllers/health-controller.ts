import { inject, injectable } from 'tsyringe';

import type { Request, Response } from 'express';

import type RateLimit from '../services/rate-limit/rate-limit';
import type FileRepository from '../services/file-repositoy/file-repository';
import type FileStorage from '../services/file-storage/file-storage';

@injectable()
export default class HealthController {
  constructor(
    @inject('RateLimit') private readonly rateLimit: RateLimit,
    @inject('FileRepository') private readonly repository: FileRepository,
    @inject('FileStorage') private readonly storage: FileStorage
  ) {}

  async status(req: Request, res: Response): Promise<void> {
    const detail = (() => {
      return ['True', 'true', 'Yes', 'yes', 'y', 't', '1'].includes(
        req.query?.detail as string
      );
    })();

    if (detail) {
      const tasks = await Promise.all([
        this.rateLimit.isLive(),
        this.repository.isLive(),
        this.storage.isLive()
      ]);

      const result = {
        cache: tasks[0],
        db: tasks[1],
        storage: tasks[2],
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };

      res.status(tasks.every((x) => x) ? 200 : 503).json(result);
      return;
    }

    res.status(200).json({
      healthy: true,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }
}
