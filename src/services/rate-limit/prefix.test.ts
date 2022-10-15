import { prefix } from './prefix';

describe('createKeyPrefix', () => {
  const IpAddress = '127.0.0.1';

  let res: string;

  beforeAll(() => {
    res = prefix(IpAddress);
  });

  it('returns prefix that starts with timestamp', () => {
    expect(res).toMatch(/^\d{8}:/g);
  });

  it('returns prefix that ends with ip address', () => {
    expect(res).toMatch(new RegExp(`:${IpAddress}$`, 'g'));
  });
});
