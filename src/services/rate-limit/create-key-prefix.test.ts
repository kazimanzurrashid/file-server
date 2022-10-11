import createKeyPrefix from './create-key-prefix';

describe('createKeyPrefix', () => {
  const IpAddress = '127.0.0.1';

  let prefix: string;

  beforeAll(() => {
    prefix = createKeyPrefix(IpAddress);
  });

  it('returns prefix that starts with timestamp', () => {
    expect(prefix).toMatch(/:\d{8}$/g);
  });

  it('returns prefix that starts with the provided ip address', () => {
    expect(prefix).toMatch(new RegExp(`^${IpAddress}:`, 'g'));
  });
});
