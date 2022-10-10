import 'reflect-metadata';

import { container } from 'tsyringe';
import type { Logger } from 'pino';

import createApp from './create-app';
import config from './config';
import GarbageCollector from './garbage-collector';

createApp().listen(config.port, () => {
  container.resolve(GarbageCollector).run();
  container.resolve<Logger>('Logger').info(`Server running on http://localhost:${config.port}/`);
});
