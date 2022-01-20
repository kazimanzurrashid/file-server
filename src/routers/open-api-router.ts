import { readFileSync } from 'fs';
import { join, resolve } from 'path';

import express, { Router } from 'express';
import { serve, setup } from 'swagger-ui-express';

export default function openApiRouter(): Router {
  const getDocument = (): unknown => {
    const path = join(resolve(), 'open-api.json');
    const content = readFileSync(path, 'utf8');

    return JSON.parse(content);
  };

  const router = express.Router();

  router.use(serve);
  router.get('/', setup(getDocument()));

  return router;
}
