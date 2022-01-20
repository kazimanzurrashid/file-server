import { Router } from 'express';

import openApiRouter from './open-api-router';

describe('openApiRouter', () => {
  describe('/', () => {
    let router: Router;

    beforeAll(() => {
      router = openApiRouter();
    });

    it('uses swagger-ui', () => {
      expect(router.stack.length).toBeGreaterThanOrEqual(2);
    });

    it('sets against GET', () => {
      expect(router.stack[2].route.path).toEqual('/');
      expect(router.stack[2].route.methods.get).toBeTruthy();
      expect(router.stack[2].route.stack).toHaveLength(1);
    });
  });
});
