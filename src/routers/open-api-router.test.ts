import { Router } from 'express';

import openApiRouter from './open-api-router';

describe('openApiRouter', () => {
  describe('GET /', () => {
    let router: Router;

    beforeAll(() => {
      router = openApiRouter();
    });

    it('uses swagger-ui', () => {
      expect(router.stack.length).toBeGreaterThanOrEqual(2);
    });

    it('handles HTTP GET', () => {
      const match = router.stack.find((x) => !!x.route);

      expect(match.route.path).toEqual('/');
      expect(match.route.methods.get).toBeTruthy();
      expect(match.route.stack).toHaveLength(1);
    });
  });
});
