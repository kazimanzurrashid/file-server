import { inject, injectable } from 'tsyringe';
import { schedule } from 'node-cron';

import clock from './lib/clock';
import IFileRepository, { IFileInfo } from './services/file-repositoy/file-repository';
import IFileStorage from './services/file-storage/file-storage';

@injectable()
export default class GarbageCollector {
  constructor(
    @inject('FileRepository') private readonly repository: IFileRepository,
    @inject('FileStorage') private readonly storage: IFileStorage,
    @inject('gcInactiveDuration') private readonly inactiveDuration: number,
    @inject('gcCronExpression') private readonly cronExpression: string
  ) {}

  run(): void {
    schedule(this.cronExpression, async () => {
      await this.cleanup();
    });
  }

  private async cleanup(): Promise<void> {
    const timestamp = new Date(clock.now().getTime() - this.inactiveDuration);

    let matched: IFileInfo[];

    do {
      matched = await this.repository.listInactiveSince(timestamp);

      const tasks = matched.map(async (fi) => {
        await this.storage.delete(fi.path);
        await this.repository.delete(fi.privateKey);
      });

      await Promise.all(tasks);

    } while (matched.length)
  }
}
