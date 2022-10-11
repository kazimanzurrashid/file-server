import clock from '../../lib/clock';

export default function createKeyPrefix(ipAddress: string): string {
  const now = clock.now();
  const today = `${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;

  return `${ipAddress}:${today}`;
}
