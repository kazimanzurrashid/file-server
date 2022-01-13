import { inject, injectable } from 'tsyringe';

import config from './config';
import Clock from './lib/clock';
import IFileRepository from './services/file-repositoy/file-repository';
import IFileStorage from './services/file-storage/file-storage';

@injectable()
export default class GarbageCollector {
  private timerHandle: NodeJS.Timeout | undefined;

  constructor(
    @inject('FileRepository') private readonly repository: IFileRepository,
    @inject('FileStorage') private readonly storage: IFileStorage
  ) {}

  run(): void {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = undefined;
    }

    this.enqueue();
  }

  private enqueue(): void {
    this.timerHandle = setTimeout(async () => {
      await this.cleanup();
      this.enqueue();
    },  config.garbageCollection.interval);
  }

  private async cleanup(): Promise<void> {
    const timestamp = new Date(
      Clock.now().getTime() -
        config.garbageCollection.inactiveDuration
    );

    const matched = await this.repository.listInactiveSince(timestamp);

    const tasks = matched.map(async (fi) => {
      await this.repository.delete(fi.privateKey);
      await this.storage.delete(fi.path);
    });

    await Promise.all(tasks);
  }
}
