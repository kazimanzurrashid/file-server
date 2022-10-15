import clock from '../../lib/clock';

export function generateTimestamp(): string {
  const now = clock.now();

  return `${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
}

export function prefix(ipAddress: string): string {
  return `${generateTimestamp()}:${ipAddress}`;
}
