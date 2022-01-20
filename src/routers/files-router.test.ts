import { Router } from 'express';

import FilesController from '../controllers/files-controller';
import filesRouter from './files-router';

describe('filesRouter', () => {
  describe('/', () => {
    let router: Router;
    let mockedControllerCreate: jest.Mock;

    beforeAll(async () => {
      mockedControllerCreate = jest.fn(async () => Promise.resolve());
      router = filesRouter({
        create: mockedControllerCreate
      } as unknown as FilesController);

      await router.stack[0].handle({ method: 'POST', headers: [] }, {}, () => {
        return;
      });
    });

    it('sets against POST', () => {
      expect(router.stack[0].route.path).toEqual('/');
      expect(router.stack[0].route.methods.post).toBeTruthy();
      expect(router.stack[0].route.stack).toHaveLength(2);
      expect(router.stack[0].route.stack[0].name).toContain('multer');
    });

    it('delegates the call to controller create', () => {
      expect(mockedControllerCreate).toHaveBeenCalled();
    });
  });

  describe('/:privateKey', () => {
    let router: Router;
    let mockedControllerDelete: jest.Mock;

    beforeAll(async () => {
      mockedControllerDelete = jest.fn(async () => Promise.resolve());
      router = filesRouter({
        delete: mockedControllerDelete
      } as unknown as FilesController);

      await router.stack[1].handle({ method: 'DELETE' }, {}, () => {
        return;
      });
    });

    it('sets against DELETE', () => {
      expect(router.stack[1].route.path).toEqual('/:privateKey');
      expect(router.stack[1].route.methods.delete).toBeTruthy();
      expect(router.stack[1].route.stack).toHaveLength(1);
    });

    it('delegates the call to controller delete', () => {
      expect(mockedControllerDelete).toHaveBeenCalled();
    });
  });

  describe('/:publicKey', () => {
    let router: Router;
    let mockedControllerGet: jest.Mock;

    beforeAll(async () => {
      mockedControllerGet = jest.fn(async () => Promise.resolve());
      router = filesRouter({
        get: mockedControllerGet
      } as unknown as FilesController);

      await router.stack[2].handle({ method: 'GET' }, {}, () => {
        return;
      });
    });

    it('sets against GET', () => {
      expect(router.stack[2].route.path).toEqual('/:publicKey');
      expect(router.stack[2].route.methods.get).toBeTruthy();
      expect(router.stack[2].route.stack).toHaveLength(1);
    });

    it('delegates the call to controller get', () => {
      expect(mockedControllerGet).toHaveBeenCalled();
    });
  });
});
