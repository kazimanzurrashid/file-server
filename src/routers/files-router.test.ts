import FilesController from '../controllers/files-controller';
import filesRouter from './files-router';

describe('filesRouter', () => {
  describe('POST /', () => {
    let mockedControllerCreate: jest.Mock;
    let match;

    beforeAll(async () => {
      mockedControllerCreate = jest.fn(async () => Promise.resolve());
      const router = filesRouter(
        {
          create: mockedControllerCreate
        } as unknown as FilesController,
        (_, __, next) => next()
      );

      match = router.stack.find(
        (x) => x.route.path === '/' && x.route.methods.post
      );

      await match.handle({ method: 'POST', headers: [] }, {}, () => {
        return;
      });
    });

    it('has multer middleware', () => {
      expect(match.route.stack).toHaveLength(2);
    });

    it('delegates to controller create', () => {
      expect(mockedControllerCreate).toHaveBeenCalled();
    });
  });

  describe('DELETE /:privateKey', () => {
    let mockedControllerDelete: jest.Mock;
    let match;

    beforeAll(async () => {
      mockedControllerDelete = jest.fn(async () => Promise.resolve());
      const router = filesRouter(
        {
          delete: mockedControllerDelete
        } as unknown as FilesController,
        () => {
          return;
        }
      );

      match = router.stack.find(
        (x) => x.route.path === '/:privateKey' && x.route.methods.delete
      );

      await match.handle({ method: 'DELETE' }, {}, () => {
        return;
      });
    });

    it('delegates to controller delete', () => {
      expect(mockedControllerDelete).toHaveBeenCalled();
    });
  });

  describe('GET /:publicKey', () => {
    let mockedControllerGet: jest.Mock;
    let match;

    beforeAll(async () => {
      mockedControllerGet = jest.fn(async () => Promise.resolve());
      const router = filesRouter(
        {
          get: mockedControllerGet
        } as unknown as FilesController,
        () => {
          return;
        }
      );

      match = router.stack.find(
        (x) => x.route.path === '/:publicKey' && x.route.methods.get
      );

      await match.handle({ method: 'GET' }, {}, () => {
        return;
      });
    });

    it('delegates to controller get', () => {
      expect(mockedControllerGet).toHaveBeenCalled();
    });
  });
});
