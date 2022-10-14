import express, { Request, Response, RequestHandler, Router } from 'express';

import FilesController from '../controllers/files-controller';

export default function filesRouter(
  controller: FilesController,
  multer: RequestHandler
): Router {
  const router = express.Router();

  router.post('/', multer, async (req: Request, res: Response) =>
    controller.create(req, res)
  );

  router.delete('/:privateKey', async (req: Request, res: Response) =>
    controller.delete(req, res)
  );

  router.get('/:publicKey', async (req: Request, res: Response) =>
    controller.get(req, res)
  );

  return router;
}
