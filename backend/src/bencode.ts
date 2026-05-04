import { Buffer } from 'node:buffer';
export type BValue = string | Buffer | number | BValue[] | { [key: string]: BValue };

export function bencode(value: BValue): Buffer {
  if (Buffer.isBuffer(value)) return Buffer.concat([Buffer.from(`${value.length}:`), value]);
  if (typeof value === 'string') return Buffer.from(`${Buffer.byteLength(value)}:${value}`, 'utf8');
  if (typeof value === 'number') return Buffer.from(`i${Math.trunc(value)}e`);
  if (Array.isArray(value)) return Buffer.concat([Buffer.from('l'), ...value.map(bencode), Buffer.from('e')]);

  const keys = Object.keys(value).sort();
  return Buffer.concat([Buffer.from('d'), ...keys.flatMap((key) => [bencode(key), bencode(value[key])]), Buffer.from('e')]);
}

export function failure(reason: string): Buffer {
  return bencode({ 'failure reason': reason });
}

export function warning(reason: string, body: Record<string, BValue>): Buffer {
  return bencode({ ...body, 'warning message': reason });
}
