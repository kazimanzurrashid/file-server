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

      match = router.stack.find((x) => x.route.path === '/');

      await match.handle({ method: 'POST', headers: [] }, {}, () => {
        return;
      });
    });

    it('handles HTTP POST', () => {
      expect(match.route.methods.post).toBeTruthy();
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

      match = router.stack.find((x) => x.route.path === '/:privateKey');

      await match.handle({ method: 'DELETE' }, {}, () => {
        return;
      });
    });

    it('handles HTTP DELETE', () => {
      expect(match.route.methods.delete).toBeTruthy();
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

      match = router.stack.find((x) => x.route.path === '/:publicKey');

      await match.handle({ method: 'GET' }, {}, () => {
        return;
      });
    });

    it('handles HTTP GET', () => {
      expect(match.route.methods.get).toBeTruthy();
    });

    it('delegates to controller get', () => {
      expect(mockedControllerGet).toHaveBeenCalled();
    });
  });
});
