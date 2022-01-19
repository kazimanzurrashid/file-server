import key from './key';

describe('key', () => {
  describe('#generate', () => {
    let res: string;

    beforeAll(() => {
      res = key.generate();
    });

    it('it only contains numbers and lower-cased [a-f] characters with length of 32', () => {
      expect(res).toMatch(/[0-9a-f]{32}/);
    });
  });
});
