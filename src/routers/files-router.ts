import { extname } from 'path';

import express, { Request, Response, Router } from 'express';
import multer from 'multer';

import config from '../config';
import Key from '../lib/key';
import FilesController from '../controllers/files-controller';

const storage = multer.diskStorage({
  destination: (
    _,
    __,
    cb: (err: Error | null, destination: string) => void
  ) => {
    cb(null, `${config.tempFolder}/`);
  },

  filename: (_, file, cb: (err: Error | null, filename: string) => void) => {
    const filename = `${Key.generate()}${extname(file.originalname)}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage
}).single('file');

export default function filesRouter(controller: FilesController): Router {
  const router = express.Router();

  router.post('/', upload, async (req: Request, res: Response) =>
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
