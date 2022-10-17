import 'reflect-metadata';

import type { Request, Response } from 'express';

import HealthController from './health-controller';
import RateLimit from '../services/rate-limit/rate-limit';
import FileRepository from '../services/file-repositoy/file-repository';
import FileStorage from '../services/file-storage/file-storage';

describe('HealthController', () => {
  describe('status', () => {
    describe('detail', () => {
      describe('healthy', () => {
        let mockedResponseStatus: jest.Mock;

        beforeAll(async () => {
          const controller = new HealthController(
            {
              isLive: async () => Promise.resolve(true)
            } as unknown as RateLimit,
            {
              isLive: async () => Promise.resolve(true)
            } as unknown as FileRepository,
            {
              isLive: async () => Promise.resolve(true)
            } as unknown as FileStorage
          );

          const req = {
            query: {
              detail: 'y'
            }
          };

          mockedResponseStatus = jest.fn(() => ({ json: jest.fn() }));

          const res = {
            status: mockedResponseStatus
          };

          await controller.status(
            req as unknown as Request,
            res as unknown as Response
          );
        });

        it('sends http status code 200', () => {
          expect(mockedResponseStatus).toHaveBeenCalledWith(200);
        });
      });

      describe('unhealthy', () => {
        describe('cache', () => {
          let mockedResponseStatus: jest.Mock;

          beforeAll(async () => {
            const controller = new HealthController(
              {
                isLive: async () => Promise.resolve(false)
              } as unknown as RateLimit,
              {
                isLive: async () => Promise.resolve(true)
              } as unknown as FileRepository,
              {
                isLive: async () => Promise.resolve(true)
              } as unknown as FileStorage
            );

            const req = {
              query: {
                detail: 'y'
              }
            };

            mockedResponseStatus = jest.fn(() => ({ json: jest.fn() }));

            const res = {
              status: mockedResponseStatus
            };

            await controller.status(
              req as unknown as Request,
              res as unknown as Response
            );
          });

          it('sends http status code 503', () => {
            expect(mockedResponseStatus).toHaveBeenCalledWith(503);
          });
        });

        describe('db', () => {
          let mockedResponseStatus: jest.Mock;

          beforeAll(async () => {
            const controller = new HealthController(
              {
                isLive: async () => Promise.resolve(true)
              } as unknown as RateLimit,
              {
                isLive: async () => Promise.resolve(false)
              } as unknown as FileRepository,
              {
                isLive: async () => Promise.resolve(true)
              } as unknown as FileStorage
            );

            const req = {
              query: {
                detail: 'y'
              }
            };

            mockedResponseStatus = jest.fn(() => ({ json: jest.fn() }));

            const res = {
              status: mockedResponseStatus
            };

            await controller.status(
              req as unknown as Request,
              res as unknown as Response
            );
          });

          it('sends http status code 503', () => {
            expect(mockedResponseStatus).toHaveBeenCalledWith(503);
          });
        });

        describe('storage', () => {
          let mockedResponseStatus: jest.Mock;

          beforeAll(async () => {
            const controller = new HealthController(
              {
                isLive: async () => Promise.resolve(true)
              } as unknown as RateLimit,
              {
                isLive: async () => Promise.resolve(true)
              } as unknown as FileRepository,
              {
                isLive: async () => Promise.resolve(false)
              } as unknown as FileStorage
            );

            const req = {
              query: {
                detail: 'y'
              }
            };

            mockedResponseStatus = jest.fn(() => ({ json: jest.fn() }));

            const res = {
              status: mockedResponseStatus
            };

            await controller.status(
              req as unknown as Request,
              res as unknown as Response
            );
          });

          it('sends http status code 503', () => {
            expect(mockedResponseStatus).toHaveBeenCalledWith(503);
          });
        });
      });
    });

    describe('simple', () => {
      describe('without query string', () => {
        let mockedResponseStatus: jest.Mock;

        beforeAll(async () => {
          const controller = new HealthController(
            undefined,
            undefined,
            undefined
          );

          const req = {
            query: {}
          };

          mockedResponseStatus = jest.fn(() => ({ json: jest.fn() }));

          const res = {
            status: mockedResponseStatus
          };

          await controller.status(
            req as unknown as Request,
            res as unknown as Response
          );
        });

        it('sends http status code 200', () => {
          expect(mockedResponseStatus).toHaveBeenCalledWith(200);
        });
      });

      describe('with query string', () => {
        let mockedResponseStatus: jest.Mock;

        beforeAll(async () => {
          const controller = new HealthController(
            undefined,
            undefined,
            undefined
          );

          const req = {
            query: {
              detail: 'false'
            }
          };

          mockedResponseStatus = jest.fn(() => ({ json: jest.fn() }));

          const res = {
            status: mockedResponseStatus
          };

          await controller.status(
            req as unknown as Request,
            res as unknown as Response
          );
        });

        it('sends http status code 200', () => {
          expect(mockedResponseStatus).toHaveBeenCalledWith(200);
        });
      });
    });
  });
});
