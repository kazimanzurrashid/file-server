import 'reflect-metadata';

import { Request, Response } from 'express';

import FilesController from './files-controller';
import IFileRepository from '../services/file-repositoy/file-repository';
import IRateLimit from '../services/rate-limit/rate-limit';
import IFileStorage from '../services/file-storage/file-storage';

describe('FilesController', () => {
  const IpAddress = '127.0.0.1';

  describe('#create', () => {
    describe('when no file is provided', () => {
      let mockedResponseStatus: jest.Mock;
      let response: { error?: string };

      beforeAll(async () => {
        const controller = new FilesController(
          undefined,
          undefined,
          undefined,
          undefined
        );

        const mockedResponseJson = jest.fn();
        mockedResponseStatus = jest.fn(() => ({ json: mockedResponseJson }));

        const res = {
          status: mockedResponseStatus
        };

        await controller.create(
          {} as unknown as Request,
          res as unknown as Response
        );
        response = mockedResponseJson.mock.calls[0][0];
      });

      it('sends http status code 422', () => {
        expect(mockedResponseStatus).toHaveBeenCalledWith(422);
      });

      it('returns error', () => {
        expect(response.error).toBeDefined();
      });
    });

    describe('when daily upload limit already reached', () => {
      let mockedFileDelete: jest.Mock;
      let mockedResponseStatus: jest.Mock;
      let response: { error?: string };

      beforeAll(async () => {
        const rateLimit = {
          canUpload: jest.fn(async () => Promise.resolve(false))
        };

        mockedFileDelete = jest.fn(async () => Promise.resolve());

        const controller = new FilesController(
          rateLimit as unknown as IRateLimit,
          undefined,
          undefined,
          mockedFileDelete
        );

        const req = {
          file: {},
          ip: IpAddress
        };

        const mockedResponseJson = jest.fn();
        mockedResponseStatus = jest.fn(() => ({ json: mockedResponseJson }));
        const res = {
          status: mockedResponseStatus
        };

        await controller.create(
          req as unknown as Request,
          res as unknown as Response
        );
        response = mockedResponseJson.mock.calls[0][0];
      });

      it('deletes temporary file', () => {
        expect(mockedFileDelete).toHaveBeenCalled();
      });

      it('sends http status code 429', () => {
        expect(mockedResponseStatus).toHaveBeenCalledWith(429);
      });

      it('returns error', () => {
        expect(response.error).toBeDefined();
      });
    });

    describe('success', () => {
      let mockedFileDelete: jest.Mock;
      let mockedResponseStatus: jest.Mock;
      let mockedStoragePut: jest.Mock;
      let mockedRepositoryAdd: jest.Mock;
      let mockedRateLimitRecordUpload: jest.Mock;
      let response: { publicKey?: string; privateKey: string };

      beforeAll(async () => {
        mockedFileDelete = jest.fn(async () => Promise.resolve());
        mockedRateLimitRecordUpload = jest.fn(async () => Promise.resolve());

        const rateLimit = {
          canUpload: jest.fn(async () => Promise.resolve(true)),
          recordUpload: mockedRateLimitRecordUpload
        };

        mockedRepositoryAdd = jest.fn(async () => Promise.resolve());
        const repository = {
          add: mockedRepositoryAdd
        };

        mockedStoragePut = jest.fn(async () => Promise.resolve());

        const storage = {
          put: mockedStoragePut
        };

        const controller = new FilesController(
          rateLimit as unknown as IRateLimit,
          repository as unknown as IFileRepository,
          storage as unknown as IFileStorage,
          mockedFileDelete
        );

        const req = {
          file: {
            path: 'c:\\.tmp\\12344.png',
            mimetype: 'image/png'
          },
          ip: IpAddress
        };

        const mockedResponseJson = jest.fn();
        mockedResponseStatus = jest.fn(() => ({ json: mockedResponseJson }));
        const res = {
          status: mockedResponseStatus
        };

        await controller.create(
          req as unknown as Request,
          res as unknown as Response
        );
        response = mockedResponseJson.mock.calls[0][0];
      });

      it('puts file into storage', () => {
        expect(mockedStoragePut).toHaveBeenCalled();
      });

      it('deletes temporary file', () => {
        expect(mockedFileDelete).toHaveBeenCalled();
      });

      it('adds file to repository', () => {
        expect(mockedRepositoryAdd).toHaveBeenCalled();
      });

      it('records upload', () => {
        expect(mockedRateLimitRecordUpload).toHaveBeenCalled();
      });

      it('sends http status code 201', () => {
        expect(mockedResponseStatus).toHaveBeenCalledWith(201);
      });

      it('returns public and private key', () => {
        expect(response.publicKey).toBeDefined();
        expect(response.privateKey).toBeDefined();
      });
    });
  });

  describe('#delete', () => {
    describe('when file does not exist', () => {
      let mockedResponseStatus: jest.Mock;
      let response: { error?: string };

      beforeAll(async () => {
        const repository = {
          delete: jest.fn(async () => Promise.resolve(undefined))
        };

        const controller = new FilesController(
          undefined,
          repository as unknown as IFileRepository,
          {} as unknown as IFileStorage,
          undefined
        );

        const req = {
          params: {
            privateKey: 'private-key'
          }
        };

        const mockedResponseJson = jest.fn();
        mockedResponseStatus = jest.fn(() => ({ json: mockedResponseJson }));
        const res = {
          status: mockedResponseStatus
        };

        await controller.delete(
          req as unknown as Request,
          res as unknown as Response
        );
        response = mockedResponseJson.mock.calls[0][0];
      });

      it('sends http status code 404', () => {
        expect(mockedResponseStatus).toHaveBeenCalledWith(404);
      });

      it('returns error', () => {
        expect(response.error).toBeDefined();
      });
    });

    describe('success', () => {
      let mockedResponseStatus: jest.Mock;
      let mockedRepositoryDelete: jest.Mock;
      let mockedStorageDelete: jest.Mock;

      beforeAll(async () => {
        mockedRepositoryDelete = jest.fn(async () => Promise.resolve({}));
        const repository = {
          delete: mockedRepositoryDelete
        };

        mockedStorageDelete = jest.fn(async () => Promise.resolve());

        const storage = {
          delete: mockedStorageDelete
        };

        const controller = new FilesController(
          undefined,
          repository as unknown as IFileRepository,
          storage as unknown as IFileStorage,
          undefined
        );

        const req = {
          params: {
            privateKey: 'private-key'
          }
        };

        mockedResponseStatus = jest.fn(() => ({ end: jest.fn() }));
        const res = {
          status: mockedResponseStatus
        };

        await controller.delete(
          req as unknown as Request,
          res as unknown as Response
        );
      });

      it('deletes file from storage', () => {
        expect(mockedStorageDelete).toHaveBeenCalled();
      });

      it('deletes file from repository', () => {
        expect(mockedRepositoryDelete).toHaveBeenCalled();
      });

      it('sends http status code 204', () => {
        expect(mockedResponseStatus).toHaveBeenCalledWith(204);
      });
    });
  });

  describe('#get', () => {
    describe('when file does not exist', () => {
      let mockedResponseStatus: jest.Mock;
      let response: { error?: string };

      beforeAll(async () => {
        const repository = {
          get: jest.fn(async () => Promise.resolve(undefined))
        };

        const controller = new FilesController(
          undefined,
          repository as unknown as IFileRepository,
          undefined,
          undefined
        );

        const req = {
          params: {
            publicKey: 'public-key'
          }
        };

        const mockedResponseJson = jest.fn();
        mockedResponseStatus = jest.fn(() => ({ json: mockedResponseJson }));

        const res = {
          status: mockedResponseStatus
        };

        await controller.get(
          req as unknown as Request,
          res as unknown as Response
        );
        response = mockedResponseJson.mock.calls[0][0];
      });

      it('sends http status code 404', () => {
        expect(mockedResponseStatus).toHaveBeenCalledWith(404);
      });

      it('returns error', () => {
        expect(response.error).toBeDefined();
      });
    });

    describe('when daily download limit already reached', () => {
      let mockedResponseStatus: jest.Mock;
      let response: { error?: string };

      beforeAll(async () => {
        const rateLimit = {
          canDownload: jest.fn(async () => Promise.resolve(false))
        };

        const repository = {
          get: jest.fn(async () => Promise.resolve({}))
        };

        const controller = new FilesController(
          rateLimit as unknown as IRateLimit,
          repository as unknown as IFileRepository,
          undefined,
          undefined
        );

        const req = {
          params: {
            publicKey: 'public-key'
          },
          ip: IpAddress
        };

        const mockedResponseJson = jest.fn();
        mockedResponseStatus = jest.fn(() => ({ json: mockedResponseJson }));

        const res = {
          status: mockedResponseStatus
        };

        await controller.get(
          req as unknown as Request,
          res as unknown as Response
        );
        response = mockedResponseJson.mock.calls[0][0];
      });

      it('sends http status code 429', () => {
        expect(mockedResponseStatus).toHaveBeenCalledWith(429);
      });

      it('returns error', () => {
        expect(response.error).toBeDefined();
      });
    });

    describe('success', () => {
      let mockedResponseStatus: jest.Mock;
      let mockedResponseContentType: jest.Mock;
      let mockedStreamPipe: jest.Mock;
      let mockedRateLimitRecordDownload: jest.Mock;

      beforeAll(async () => {
        mockedRateLimitRecordDownload = jest.fn(async () => Promise.resolve());

        const rateLimit = {
          canDownload: jest.fn(async () => Promise.resolve(true)),
          recordDownload: mockedRateLimitRecordDownload
        };

        const repository = {
          get: jest.fn(async () =>
            Promise.resolve({
              mimeType: 'image/png'
            })
          )
        };

        mockedStreamPipe = jest.fn();

        const storage = {
          load: jest.fn(async () =>
            Promise.resolve({
              pipe: mockedStreamPipe
            })
          )
        };

        const controller = new FilesController(
          rateLimit as unknown as IRateLimit,
          repository as unknown as IFileRepository,
          storage as unknown as IFileStorage,
          undefined
        );

        const req = {
          params: {
            publicKey: 'public-key'
          },
          ip: IpAddress
        };

        mockedResponseContentType = jest.fn();
        mockedResponseStatus = jest.fn(() => ({
          contentType: mockedResponseContentType
        }));
        const res = {
          status: mockedResponseStatus,
          on: async (_, action: () => Promise<void>) => action()
        };

        await controller.get(
          req as unknown as Request,
          res as unknown as Response
        );
      });

      it('sends http status code 200', () => {
        expect(mockedResponseStatus).toHaveBeenCalledWith(200);
      });

      it('sends correct mime-type', () => {
        expect(mockedResponseContentType).toHaveBeenCalledWith('image/png');
      });

      it('pipes file stream to response', () => {
        expect(mockedStreamPipe).toHaveBeenCalled();
      });

      it('records download', () => {
        expect(mockedRateLimitRecordDownload).toHaveBeenCalled();
      });
    });
  });
});
