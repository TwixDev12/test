import { Buffer } from 'node:buffer';
export type AnnounceParams = {
  infoHash: Buffer;
  peerId: Buffer;
  port: number;
  uploaded: bigint;
  downloaded: bigint;
  left: bigint;
  event?: string;
  compact: boolean;
  numwant: number;
};

function percentDecodeBytes(input: string): Buffer {
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '%' && i + 2 < input.length) {
      const hex = input.slice(i + 1, i + 3);
      const n = Number.parseInt(hex, 16);
      if (!Number.isNaN(n)) {
        bytes.push(n);
        i += 2;
        continue;
      }
    }
    // Query strings use + for spaces in web forms; torrent clients should percent-encode binary values.
    if (ch === '+') bytes.push(0x20);
    else bytes.push(Buffer.from(ch, 'binary')[0]);
  }
  return Buffer.from(bytes);
}

export function rawQuery(reqUrl: string): Map<string, string[]> {
  const idx = reqUrl.indexOf('?');
  const query = idx >= 0 ? reqUrl.slice(idx + 1) : '';
  const map = new Map<string, string[]>();
  for (const pair of query.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const rawKey = eq >= 0 ? pair.slice(0, eq) : pair;
    const rawValue = eq >= 0 ? pair.slice(eq + 1) : '';
    const key = percentDecodeBytes(rawKey).toString('utf8');
    const arr = map.get(key) ?? [];
    arr.push(rawValue);
    map.set(key, arr);
  }
  return map;
}

export function parseAnnounceParams(reqUrl: string): AnnounceParams {
  const q = rawQuery(reqUrl);
  const firstRaw = (name: string, required = true): string => {
    const v = q.get(name)?.[0];
    if (v === undefined && required) throw new Error(`missing ${name}`);
    return v ?? '';
  };
  const firstText = (name: string, required = true): string => percentDecodeBytes(firstRaw(name, required)).toString('utf8');
  const firstBigInt = (name: string): bigint => {
    const v = firstText(name);
    if (!/^\d+$/.test(v)) throw new Error(`invalid ${name}`);
    return BigInt(v);
  };
  const firstNumber = (name: string, fallback?: number): number => {
    const raw = firstText(name, fallback === undefined);
    if (!raw && fallback !== undefined) return fallback;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) throw new Error(`invalid ${name}`);
    return n;
  };

  const infoHash = percentDecodeBytes(firstRaw('info_hash'));
  const peerId = percentDecodeBytes(firstRaw('peer_id'));
  if (infoHash.length !== 20) throw new Error('info_hash must be 20 bytes');
  if (peerId.length !== 20) throw new Error('peer_id must be 20 bytes');

  return {
    infoHash,
    peerId,
    port: firstNumber('port'),
    uploaded: firstBigInt('uploaded'),
    downloaded: firstBigInt('downloaded'),
    left: firstBigInt('left'),
    event: firstText('event', false) || undefined,
    compact: firstText('compact', false) === '1',
    numwant: Math.min(Math.max(firstNumber('numwant', 50), 0), 200),
  };
}

export function compactPeers(rows: Array<{ ip: string; port: number }>): Buffer {
  const chunks: Buffer[] = [];
  for (const row of rows) {
    const parts = row.ip.split('.').map((x) => Number.parseInt(x, 10));
    if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) continue;
    const b = Buffer.alloc(6);
    parts.forEach((part, idx) => b[idx] = part);
    b.writeUInt16BE(row.port, 4);
    chunks.push(b);
  }
  return Buffer.concat(chunks);
}

export function toSafeNumber(v: bigint): number {
  const max = BigInt(Number.MAX_SAFE_INTEGER);
  return Number(v > max ? max : v);
}
