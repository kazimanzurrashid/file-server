import 'reflect-metadata';

import { join, resolve } from 'path';
import { Server } from 'http';

import request from 'supertest';

import createApp from './create-app';
import config from './config';

type ErrorResult = {
  error: string;
};

function range(start: number, end: number): number[] {
  return Array.from({ length: end + 1 - start }, (_, i) => start + i);
}

describe('app', () => {
  const file = join(resolve(), 'requirements.pdf');

  describe('POST /files', () => {
    describe('success', () => {
      let server: Server;

      let statusCode: number;
      let result: { publicKey: string; privateKey: string };

      beforeAll(async () => {
        return new Promise<void>((done) => {
          const app = createApp();

          server = app.listen(async () => {
            const res = await request(app).post('/files').attach('file', file);

            statusCode = res.statusCode;
            result = res.body;

            done();
          });
        });
      });

      it('responds with http status code 201', () => {
        expect(statusCode).toEqual(201);
      });

      it('returns public and private key', () => {
        expect(result.publicKey).toBeDefined();
        expect(result.privateKey).toBeDefined();
      });

      afterAll((done) => {
        server.close(done);
      });
    });

    describe('when daily upload limit already reached', () => {
      let server: Server;

      let statusCode: number;
      let result: ErrorResult;

      jest.setTimeout(1000 * 30);

      beforeAll(async () => {
        return new Promise<void>((done) => {
          const app = createApp();

          server = app.listen(async () => {
            const api = request(app);

            await Promise.all(
              range(1, config.maxRateLimit.uploads).map(async () => {
                await api.post('/files').attach('file', file);
              })
            );

            const res = await api.post('/files').attach('file', file);

            statusCode = res.statusCode;
            result = res.body;

            done();
          });
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

      afterAll((done) => {
        server.close(done);
      });
    });

    describe('when no file is provided', () => {
      let server: Server;

      let statusCode: number;
      let result: ErrorResult;

      beforeAll(async () => {
        return new Promise<void>((done) => {
          const app = createApp();

          server = app.listen(async () => {
            const res = await request(app).post('/files');

            statusCode = res.statusCode;
            result = res.body;

            done();
          });
        });
      });

      it('responds with http status code 422', () => {
        expect(statusCode).toEqual(422);
      });

      it('returns error', () => {
        // eslint-disable-next-line i18n-text/no-en
        expect(result.error).toEqual('File is required!');
      });

      afterAll((done) => {
        server.close(done);
      });
    });
  });

  describe('DELETE /files/:privateKey', () => {
    describe('success', () => {
      let server: Server;

      let statusCode: number;

      beforeAll(async () => {
        return new Promise<void>((done) => {
          const app = createApp();

          server = app.listen(async () => {
            const api = request(app);

            const res1 = await api.post('/files').attach('file', file);
            const res2 = await api.delete(`/files/${res1.body.privateKey}`);

            statusCode = res2.statusCode;

            done();
          });
        });
      });

      it('responds with http status code 204', () => {
        expect(statusCode).toEqual(204);
      });

      afterAll((done) => {
        server.close(done);
      });
    });

    describe('when file does not exist', () => {
      let server: Server;

      let statusCode: number;
      let result: ErrorResult;

      beforeAll(async () => {
        return new Promise<void>((done) => {
          const app = createApp();

          server = app.listen(async () => {
            const res = await request(app).delete('/files/i-dont-exist');

            statusCode = res.statusCode;
            result = res.body;

            done();
          });
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

      afterAll((done) => {
        server.close(done);
      });
    });
  });

  describe('GET /files/:publicKey', () => {
    describe('success', () => {
      let server: Server;

      let statusCode: number;
      let contentType: string;
      let body: Buffer;

      beforeAll(async () => {
        return new Promise<void>((done) => {
          const app = createApp();

          server = app.listen(async () => {
            const api = request(app);

            const res1 = await api.post('/files').attach('file', file);

            const res2 = await api.get(`/files/${res1.body.publicKey}`);

            statusCode = res2.statusCode;
            contentType = res2.headers['content-type'];
            body = res2.body;

            done();
          });
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

      afterAll((done) => {
        server.close(done);
      });
    });

    describe('when daily download limit already reached', () => {
      let server: Server;

      let statusCode: number;
      let result: ErrorResult;

      jest.setTimeout(1000 * 30);

      beforeAll(async () => {
        return new Promise<void>((done) => {
          const app = createApp();

          server = app.listen(async () => {
            const api = request(app);

            const res1 = await api.post('/files').attach('file', file);

            await Promise.all(
              range(1, config.maxRateLimit.downloads).map(async () => {
                await api.get(`/files/${res1.body.publicKey}`);
              })
            );

            const res2 = await api.get(`/files/${res1.body.publicKey}`);

            statusCode = res2.statusCode;
            result = res2.body;

            done();
          });
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

      afterAll((done) => {
        server.close(done);
      });
    });

    describe('when file does not exist', () => {
      let server: Server;

      let statusCode: number;
      let result: ErrorResult;

      beforeAll(async () => {
        return new Promise<void>((done) => {
          const app = createApp();

          server = app.listen(async () => {
            const res = await request(app).get('/files/i-dont-exist');

            statusCode = res.statusCode;
            result = res.body;

            done();
          });
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

      afterAll((done) => {
        server.close(done);
      });
    });
  });

  describe('GET /', () => {
    describe('success', () => {
      let server: Server;

      let statusCode: number;

      beforeAll((done) => {
        const app = createApp();

        server = app.listen(() => {
          request(app)
            .get('/')
            .end((err, res) => {
              if (err) {
                throw err;
              }

              statusCode = res.statusCode;
              done();
            });
        });
      });

      afterAll((done) => {
        server.close(done);
      });

      it('responds with http status code 200', () => {
        expect(statusCode).toEqual(200);
      });
    });
  });
});
