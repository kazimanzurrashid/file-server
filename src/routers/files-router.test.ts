import FilesController from '../controllers/files-controller';
import filesRouter from './files-router';

describe('filesRouter', () => {
  describe('/', () => {
    let match;
    let mockedControllerCreate: jest.Mock;

    beforeAll(async () => {
      mockedControllerCreate = jest.fn(async () => Promise.resolve());
      const router = filesRouter({
        create: mockedControllerCreate
      } as unknown as FilesController);

      match = router.stack.find((x) => x.route.path === '/');

      await match.handle({ method: 'POST', headers: [] }, {}, () => {
        return;
      });
    });

    it('sets against HTTP POST', () => {
      expect(match.route.methods.post).toBeTruthy();
      expect(match.route.stack).toHaveLength(2);
      expect(match.route.stack[0].name).toContain('multer');
    });

    it('delegates the call to controller create', () => {
      expect(mockedControllerCreate).toHaveBeenCalled();
    });
  });

  describe('/:privateKey', () => {
    let match;
    let mockedControllerDelete: jest.Mock;

    beforeAll(async () => {
      mockedControllerDelete = jest.fn(async () => Promise.resolve());
      const router = filesRouter({
        delete: mockedControllerDelete
      } as unknown as FilesController);

      match = router.stack.find((x) => x.route.path === '/:privateKey');

      await match.handle({ method: 'DELETE' }, {}, () => {
        return;
      });
    });

    it('sets against HTTP DELETE', () => {
      expect(match.route.methods.delete).toBeTruthy();
      expect(match.route.stack).toHaveLength(1);
    });

    it('delegates the call to controller delete', () => {
      expect(mockedControllerDelete).toHaveBeenCalled();
    });
  });

  describe('/:publicKey', () => {
    let match;
    let mockedControllerGet: jest.Mock;

    beforeAll(async () => {
      mockedControllerGet = jest.fn(async () => Promise.resolve());
      const router = filesRouter({
        get: mockedControllerGet
      } as unknown as FilesController);

      match = router.stack.find((x) => x.route.path === '/:publicKey');

      await match.handle({ method: 'GET' }, {}, () => {
        return;
      });
    });

    it('sets against GET', () => {
      expect(match.route.methods.get).toBeTruthy();
      expect(match.route.stack).toHaveLength(1);
    });

    it('delegates the call to controller get', () => {
      expect(mockedControllerGet).toHaveBeenCalled();
    });
  });
});
