import 'reflect-metadata';

import { join, resolve as pathResolve } from 'path';

import { container } from 'tsyringe';

import type { Express } from 'express';

import request from 'supertest';

import config from './config';
import createApp from './create-app';
import FileRepository, {
  FileInfo
} from './services/file-repositoy/file-repository';
import FileStorage from './services/file-storage/file-storage';
import RateLimit from './services/rate-limit/rate-limit';

type ErrorResult = {
  error: string;
};

type UploadedFile = Pick<FileInfo, 'privateKey' | 'publicKey'>;

async function runApp(
  action: (newApp: Express) => Promise<void>
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const app = createApp();

      const server = app.listen(async () => {
        try {
          await action(app);

          server.close((err) => {
            if (err) {
              reject(err);
              return;
            }

            resolve();
          });
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function remove(...uploadedFiles: UploadedFile[]): Promise<void> {
  const repository = container.resolve<FileRepository>('FileRepository');
  const storage = container.resolve<FileStorage>('FileStorage');

  for (const uploadedFile of uploadedFiles) {
    const file = await repository.get(uploadedFile.publicKey);

    if (!file) {
      break;
    }

    await storage.delete(file.path);
    await repository.delete(uploadedFile.privateKey);
  }
}

async function resetStat(): Promise<void> {
  await container.resolve<RateLimit>('RateLimit').reset();
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end + 1 - start }, (_, i) => start + i);
}

describe('integrations', () => {
  const file = join(pathResolve(), 'requirements.pdf');

  describe('POST /files', () => {
    describe('success', () => {
      const uploadedFiles: UploadedFile[] = [];

      let statusCode: number;
      let result: UploadedFile;

      beforeAll(async () => {
        await runApp(async (app) => {
          const res = await request(app).post('/files').attach('file', file);

          uploadedFiles.push(res.body);

          statusCode = res.statusCode;
          result = res.body;
        });
      });

      it('responds with http status code 201', () => {
        expect(statusCode).toEqual(201);
      });

      it('returns public and private key', () => {
        expect(result.publicKey).toBeDefined();
        expect(result.privateKey).toBeDefined();
      });

      afterAll(async () => {
        await Promise.all([remove(...uploadedFiles), resetStat()]);
      });
    });

    describe('when daily upload limit already reached', () => {
      const uploadedFiles: UploadedFile[] = [];

      let statusCode: number;
      let result: ErrorResult;

      beforeAll(async () => {
        await runApp(async (app) => {
          const api = request(app);

          await Promise.all(
            range(1, config.rateLimit.max.uploads).map(async () => {
              const res1 = await api
                .post('/files')
                .attach('file', file)
                .expect(201);
              uploadedFiles.push(res1.body);
            })
          );

          const res2 = await api.post('/files').attach('file', file);

          statusCode = res2.statusCode;
          result = res2.body;
        });
      });

      it('responds with http status code 429', () => {
        expect(statusCode).toEqual(429);
      });

      it('returns error', () => {
        expect(result.error).toEqual(
          // eslint-disable-next-line i18n-text/no-en
          'You have already reached your daily upload limit!'
        );
      });

      afterAll(async () => {
        await Promise.all([remove(...uploadedFiles), resetStat()]);
      });
    });

    describe('when no file is provided', () => {
      let statusCode: number;
      let result: ErrorResult;

      beforeAll(async () => {
        await runApp(async (app) => {
          const res = await request(app).post('/files');

          statusCode = res.statusCode;
          result = res.body;
        });
      });

      it('responds with http status code 422', () => {
        expect(statusCode).toEqual(422);
      });

      it('returns error', () => {
        // eslint-disable-next-line i18n-text/no-en
        expect(result.error).toEqual('File is required!');
      });
    });
  });

  describe('DELETE /files/:privateKey', () => {
    describe('success', () => {
      const uploadedFiles: UploadedFile[] = [];

      let statusCode: number;

      beforeAll(async () => {
        await runApp(async (app) => {
          const api = request(app);

          const res1 = await api
            .post('/files')
            .attach('file', file)
            .expect(201);

          uploadedFiles.push(res1.body);

          const res2 = await api.delete(`/files/${res1.body.privateKey}`);

          statusCode = res2.statusCode;
        });
      });

      it('responds with http status code 204', () => {
        expect(statusCode).toEqual(204);
      });

      afterAll(async () => {
        await Promise.all([remove(...uploadedFiles), resetStat()]);
      });
    });

    describe('when file does not exist', () => {
      let statusCode: number;
      let result: ErrorResult;

      beforeAll(async () => {
        await runApp(async (app) => {
          const res = await request(app).delete('/files/i-dont-exist');

          statusCode = res.statusCode;
          result = res.body;
        });
      });

      it('responds with http status code 404', () => {
        expect(statusCode).toEqual(404);
      });

      it('returns error', () => {
        expect(result.error).toEqual(
          // eslint-disable-next-line i18n-text/no-en
          'File does not exist!'
        );
      });
    });
  });

  describe('GET /files/:publicKey', () => {
    describe('success', () => {
      const uploadedFiles: UploadedFile[] = [];

      let statusCode: number;
      let contentType: string;
      let body: Buffer;

      beforeAll(async () => {
        return runApp(async (app) => {
          const api = request(app);

          const res1 = await api
            .post('/files')
            .attach('file', file)
            .expect(201);

          uploadedFiles.push(res1.body);

          const res2 = await api.get(`/files/${res1.body.publicKey}`);

          statusCode = res2.statusCode;
          contentType = res2.headers['content-type'];
          body = res2.body;
        });
      });

      it('responds with http status code 200', () => {
        expect(statusCode).toEqual(200);
      });

      it('responds with correct mime type', () => {
        expect(contentType).toEqual('application/pdf');
      });

      it('returns file body', () => {
        expect(body).toBeDefined();
      });

      afterAll(async () => {
        await Promise.all([remove(...uploadedFiles), resetStat()]);
      });
    });

    describe('when daily download limit already reached', () => {
      const uploadedFiles: UploadedFile[] = [];

      let statusCode: number;
      let result: ErrorResult;

      beforeAll(async () => {
        await runApp(async (app) => {
          const api = request(app);

          const res1 = await api
            .post('/files')
            .attach('file', file)
            .expect(201);

          uploadedFiles.push(res1.body);

          await Promise.all(
            range(1, config.rateLimit.max.downloads).map(async () => {
              await api.get(`/files/${res1.body.publicKey}`).expect(200);
            })
          );

          const res2 = await api.get(`/files/${res1.body.publicKey}`);

          statusCode = res2.statusCode;
          result = res2.body;
        });
      });

      it('responds with http status code 429', () => {
        expect(statusCode).toEqual(429);
      });

      it('returns error', () => {
        expect(result.error).toEqual(
          // eslint-disable-next-line i18n-text/no-en
          'You have already reached your daily download limit!'
        );
      });

      afterAll(async () => {
        await Promise.all([remove(...uploadedFiles), resetStat()]);
      });
    });

    describe('when file does not exist', () => {
      let statusCode: number;
      let result: ErrorResult;

      beforeAll(async () => {
        await runApp(async (app) => {
          const res = await request(app).get('/files/i-dont-exist');

          statusCode = res.statusCode;
          result = res.body;
        });
      });

      it('responds with http status code 404', () => {
        expect(statusCode).toEqual(404);
      });

      it('returns error', () => {
        expect(result.error).toEqual(
          // eslint-disable-next-line i18n-text/no-en
          'File does not exist!'
        );
      });
    });
  });

  describe('GET /', () => {
    describe('success', () => {
      let statusCode: number;

      beforeAll(async () => {
        await runApp(async (app) => {
          const res = await request(app).get('/');

          statusCode = res.statusCode;
        });
      });

      it('responds with http status code 200', () => {
        expect(statusCode).toEqual(200);
      });
    });
  });

  describe('ALL OTHER STUFFS', () => {
    describe('success', () => {
      let statusCode: number;
      let result: ErrorResult;

      beforeAll(async () => {
        await runApp(async (app) => {
          const response = await request(app).get('/foo-bar');

          statusCode = response.statusCode;
          result = response.body;
        });
      });

      it('responds with http status code 404', () => {
        expect(statusCode).toEqual(404);
      });

      it('returns error', () => {
        expect(result.error).toBeDefined();
      });
    });
  });
});
