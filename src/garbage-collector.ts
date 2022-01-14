import { inject, injectable } from 'tsyringe';

import Clock from './lib/clock';
import IFileRepository from './services/file-repositoy/file-repository';
import IFileStorage from './services/file-storage/file-storage';

@injectable()
export default class GarbageCollector {
  // eslint-disable-next-line no-undef
  private timerHandle: NodeJS.Timeout | undefined;

  constructor(
    @inject('FileRepository') private readonly repository: IFileRepository,
    @inject('FileStorage') private readonly storage: IFileStorage,
    @inject('gcInactiveDuration') private readonly inactiveDuration,
    @inject('gcInterval') private readonly interval
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
    }, this.interval);
  }

  private async cleanup(): Promise<void> {
    const timestamp = new Date(Clock.now().getTime() - this.inactiveDuration);

    const matched = await this.repository.listInactiveSince(timestamp);

    const tasks = matched.map(async (fi) => {
      await this.repository.delete(fi.privateKey);
      await this.storage.delete(fi.path);
    });

    await Promise.all(tasks);
  }
}
