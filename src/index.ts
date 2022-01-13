import 'reflect-metadata';

import { container } from 'tsyringe';

import createApp from './create-app';
import config from './config';
import GarbageCollector from './garbage-collector';

createApp().listen(config.port, () => {
  container.resolve(GarbageCollector).run();

  // eslint-disable-next-line no-console
  console.info(`Server running on http://localhost:${config.port}/`);
});
