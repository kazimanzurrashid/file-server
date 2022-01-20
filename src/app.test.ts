import 'reflect-metadata';

import { join, resolve } from 'path';
import { Server } from 'http';

import request from 'supertest';

import createApp from './create-app';
import config from './config';

describe('app', () => {
  const file = join(resolve(), 'requirements.pdf');

  describe('POST /files', () => {
    describe('success', () => {
      let server: Server;

      let statusCode: number;
      let result: { publicKey: string; privateKey: string };

      beforeAll((done) => {
        const app = createApp();

        server = app.listen(() => {
          request(app)
            .post('/files')
            .attach('file', file)
            .end((err, res) => {
              if (err) {
                throw err;
              }

              statusCode = res.statusCode;
              result = res.body;
              done();
            });
        });
      });

      afterAll((done) => {
        server.close(done);
      });

      it('responds with http status code 201', () => {
        expect(statusCode).toEqual(201);
      });

      it('returns public and private key', () => {
        expect(result.publicKey).toBeDefined();
        expect(result.privateKey).toBeDefined();
      });
    });

    describe('when daily upload limit already reached', () => {
      let server: Server;

      let statusCode: number;
      let result: { error: string };

      jest.setTimeout(1000 * 30);

      beforeAll((done) => {
        const app = createApp();

        server = app.listen(() => {
          const api = request(app);
          const max = config.maxRateLimit.uploads;

          for (let i = 0; i <= max; i++) {
            ((counter: number) => {
              setTimeout(() => {
                api
                  .post('/files')
                  .attach('file', file)
                  .end((err, res) => {
                    if (err) {
                      throw err;
                    }

                    statusCode = res.statusCode;
                    result = res.body;

                    if (counter === max) {
                      done();
                    }
                  });
              }, 100 * counter);
            })(i);
          }
        });
      });

      afterAll((done) => {
        server.close(done);
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
    });

    describe('when no file is provided', () => {
      let server: Server;

      let statusCode: number;
      let result: { error: string };

      beforeAll((done) => {
        const app = createApp();

        server = app.listen(() => {
          request(app)
            .post('/files')
            .end((err, res) => {
              if (err) {
                throw err;
              }

              statusCode = res.statusCode;
              result = res.body;
              done();
            });
        });
      });

      afterAll((done) => {
        server.close(done);
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

  describe('DELETE /files', () => {
    describe('success', () => {
      let server: Server;

      let statusCode: number;

      beforeAll((done) => {
        const app = createApp();

        server = app.listen(() => {
          const api = request(app);

          api
            .post('/files')
            .attach('file', file)
            .end((err1, res1) => {
              if (err1) {
                throw err1;
              }

              api.delete(`/files/${res1.body.privateKey}`).end((err2, res2) => {
                if (err2) {
                  throw err1;
                }

                statusCode = res2.statusCode;
                done();
              });
            });
        });
      });

      afterAll((done) => {
        server.close(done);
      });

      it('responds with http status code 204', () => {
        expect(statusCode).toEqual(204);
      });
    });

    describe('when file does not exist', () => {
      let server: Server;

      let statusCode: number;
      let result: { error: string };

      beforeAll((done) => {
        const app = createApp();

        server = app.listen(() => {
          request(app)
            .delete('/files/i-dont-exist')
            .end((err, res) => {
              if (err) {
                throw err;
              }

              statusCode = res.statusCode;
              result = res.body;
              done();
            });
        });
      });

      afterAll((done) => {
        server.close(done);
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

  describe('GET /files', () => {
    describe('success', () => {
      let server: Server;

      let statusCode: number;
      let contentType: string;
      let body: Buffer;

      beforeAll((done) => {
        const app = createApp();

        server = app.listen(() => {
          const api = request(app);

          api
            .post('/files')
            .attach('file', file)
            .end((err1, res1) => {
              if (err1) {
                throw err1;
              }

              api.get(`/files/${res1.body.publicKey}`).end((err2, res2) => {
                if (err2) {
                  throw err1;
                }

                statusCode = res2.statusCode;
                contentType = res2.headers['content-type'];
                body = res2.body;
                done();
              });
            });
        });
      });

      afterAll((done) => {
        server.close(done);
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
    });

    describe('when daily download limit already reached', () => {
      let server: Server;

      let statusCode: number;
      let result: { error: string };

      jest.setTimeout(1000 * 30);

      beforeAll((done) => {
        const app = createApp();

        server = app.listen(() => {
          const api = request(app);
          api
            .post('/files')
            .attach('file', file)
            .end((err1, res1) => {
              if (err1) {
                throw err1;
              }

              const publicKey = res1.body.publicKey;

              const max = config.maxRateLimit.downloads;

              for (let i = 0; i <= max; i++) {
                ((counter: number) => {
                  setTimeout(() => {
                    api.get(`/files/${publicKey}`).end((err2, res2) => {
                      if (err2) {
                        throw err2;
                      }

                      statusCode = res2.statusCode;
                      result = res2.body;

                      if (counter === max) {
                        done();
                      }
                    });
                  }, 100 * counter);
                })(i);
              }
            });
        });
      });

      afterAll((done) => {
        server.close(done);
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
    });

    describe('when file does not exist', () => {
      let server: Server;

      let statusCode: number;
      let result: { error: string };

      beforeAll((done) => {
        const app = createApp();

        server = app.listen(() => {
          request(app)
            .get('/files/i-dont-exist')
            .end((err, res) => {
              if (err) {
                throw err;
              }

              statusCode = res.statusCode;
              result = res.body;
              done();
            });
        });
      });

      afterAll((done) => {
        server.close(done);
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
