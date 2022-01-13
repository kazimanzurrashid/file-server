import Key from './key';

describe('Key', () => {
  describe('#generate', () => {
    let key: string;

    beforeAll(() => {
      key = Key.generate();
    });

    it('it only contains numbers and lower-cased [a-f] characters with length of 32', () => {
      expect(key).toMatch(/[0-9a-f]{32}/);
    });
  });
});
