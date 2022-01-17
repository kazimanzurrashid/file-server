import clock from './clock';

describe('clock', () => {
  describe('getting now', () => {
    it('returns current date time', () => {
      expect(clock.now().getTime()).toBeLessThanOrEqual(new Date().getTime());
    });
  });

  describe('setting now', () => {
    beforeAll(() => {
      clock.now = () => new Date(2000, 3, 15, 17, 45);
    });

    afterAll(() => {
      clock.reset();
    });

    it('returns the previously set date time', () => {
      const now = clock.now();
      expect(now.getFullYear()).toEqual(2000);
      expect(now.getMonth()).toEqual(3);
      expect(now.getDate()).toEqual(15);
      expect(now.getHours()).toEqual(17);
      expect(now.getMinutes()).toEqual(45);
    });
  });
});
