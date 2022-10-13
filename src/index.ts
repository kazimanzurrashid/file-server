import 'reflect-metadata';

import { container } from 'tsyringe';
import type { Logger } from 'pino';

import createApp from './create-app';
import config from './config';
import GarbageCollector from './garbage-collector';

config.validate();

createApp().listen(config.port, () => {
  container
    .resolve<Logger>('Logger')
    // eslint-disable-next-line i18n-text/no-en
    .info(`Server running on http://localhost:${config.port}/`);

  if (config.garbageCollection.enabled) {
    container.resolve(GarbageCollector).run();
  }
});
