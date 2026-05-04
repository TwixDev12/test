import 'reflect-metadata';
import { Controller, Get, Module, Param, Req, Res } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import rateLimit from '@fastify/rate-limit';
import { FastifyReply, FastifyRequest } from 'fastify';
import { pool, redis, withTransaction } from './db';
import { bencode, failure } from './bencode';
import { compactPeers, parseAnnounceParams } from './announce-utils';

type DbUser = {
  id: string;
  class: 'newbie' | 'member' | 'elite' | 'vip' | 'disabled';
  uploaded_bytes: string;
  downloaded_bytes: string;
  is_enabled: boolean;
  is_download_enabled: boolean;
};

type DbTorrent = {
  id: string;
  status: 'pending' | 'approved' | 'dead' | 'deleted';
  size_bytes: string;
};

const ANNOUNCE_INTERVAL = Number(process.env.ANNOUNCE_INTERVAL_SECONDS ?? 1800);
const ANNOUNCE_MIN_INTERVAL = Number(process.env.ANNOUNCE_MIN_INTERVAL_SECONDS ?? 900);

function clientIp(req: FastifyRequest): string {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string') return xf.split(',')[0].trim();
  return req.ip;
}

function ratio(uploaded: bigint, downloaded: bigint): number {
  if (downloaded === 0n) return Number.POSITIVE_INFINITY;
  return Number(uploaded) / Number(downloaded);
}

function mayDownload(user: DbUser): boolean {
  if (!user.is_enabled || user.class === 'disabled') return false;
  if (!user.is_download_enabled) return false;
  if (user.class === 'vip') return true;
  const downloaded = BigInt(user.downloaded_bytes);
  const uploaded = BigInt(user.uploaded_bytes);
  const fiveGiB = 5n * 1024n * 1024n * 1024n;
  return downloaded < fiveGiB || ratio(uploaded, downloaded) >= 0.4;
}

@Controller()
class AppController {
  @Get('/health')
  async health() {
    const db = await pool.query('SELECT 1 AS ok');
    const pong = await redis.ping();
    return { ok: db.rows[0].ok === 1 && pong === 'PONG' };
  }

  @Get('/announce/:passkey')
  async announce(@Param('passkey') passkey: string, @Req() req: FastifyRequest, @Res() res: FastifyReply) {
    res.header('content-type', 'text/plain; charset=ISO-8859-1');

    if (!/^[a-f0-9]{64}$/i.test(passkey)) {
      return res.send(failure('invalid passkey'));
    }

    let params;
    try {
      params = parseAnnounceParams(req.raw.url ?? req.url);
    } catch (error) {
      return res.send(failure(error instanceof Error ? error.message : 'bad announce'));
    }

    const ip = clientIp(req);
    const infoHashHex = params.infoHash.toString('hex');
    const peerIdHex = params.peerId.toString('hex');

    try {
      const result = await withTransaction(async (client) => {
        const userRes = await client.query<DbUser>(
          `SELECT id, class, uploaded_bytes, downloaded_bytes, is_enabled, is_download_enabled
           FROM users WHERE passkey = $1 FOR UPDATE`,
          [passkey.toLowerCase()],
        );
        const user = userRes.rows[0];
        if (!user) throw new Error('unknown passkey');
        if (!user.is_enabled || user.class === 'disabled') throw new Error('account disabled');

        const torrentRes = await client.query<DbTorrent>(
          `SELECT id, status, size_bytes FROM torrents WHERE info_hash = decode($1, 'hex')`,
          [infoHashHex],
        );
        const torrent = torrentRes.rows[0];
        if (!torrent || torrent.status !== 'approved') throw new Error('torrent is not approved');
        if (params.left > 0n && !mayDownload(user)) throw new Error('download disabled: ratio too low');

        const previousRes = await client.query(
          `SELECT uploaded_abs, downloaded_abs, left_bytes, announced_at
           FROM peers WHERE torrent_id = $1 AND user_id = $2 AND peer_id = decode($3, 'hex') FOR UPDATE`,
          [torrent.id, user.id, peerIdHex],
        );
        const previous = previousRes.rows[0];
        const uploadedDelta = previous ? BigInt(params.uploaded) - BigInt(previous.uploaded_abs) : 0n;
        const downloadedDelta = previous ? BigInt(params.downloaded) - BigInt(previous.downloaded_abs) : 0n;
        const safeUploadedDelta = uploadedDelta > 0n ? uploadedDelta : 0n;
        const safeDownloadedDelta = downloadedDelta > 0n ? downloadedDelta : 0n;
        const seeder = params.left === 0n;
        const suspicious = uploadedDelta < 0n || downloadedDelta < 0n || safeUploadedDelta > BigInt(torrent.size_bytes) * 2n;

        if (params.event === 'stopped') {
          await client.query(
            `DELETE FROM peers WHERE torrent_id = $1 AND user_id = $2 AND peer_id = decode($3, 'hex')`,
            [torrent.id, user.id, peerIdHex],
          );
        } else {
          await client.query(
            `INSERT INTO peers (torrent_id, user_id, peer_id, ip, port, user_agent, uploaded_abs, downloaded_abs, left_bytes, seeder, event, announced_at)
             VALUES ($1, $2, decode($3, 'hex'), $4::inet, $5, $6, $7, $8, $9, $10, $11, now())
             ON CONFLICT (torrent_id, user_id, peer_id) DO UPDATE SET
               ip = EXCLUDED.ip,
               port = EXCLUDED.port,
               user_agent = EXCLUDED.user_agent,
               uploaded_abs = EXCLUDED.uploaded_abs,
               downloaded_abs = EXCLUDED.downloaded_abs,
               left_bytes = EXCLUDED.left_bytes,
               seeder = EXCLUDED.seeder,
               event = EXCLUDED.event,
               announced_at = now()`,
            [
              torrent.id,
              user.id,
              peerIdHex,
              ip,
              params.port,
              req.headers['user-agent'] ?? null,
              params.uploaded.toString(),
              params.downloaded.toString(),
              params.left.toString(),
              seeder,
              params.event ?? null,
            ],
          );
        }

        if (!suspicious && (safeUploadedDelta > 0n || safeDownloadedDelta > 0n)) {
          await client.query(
            `UPDATE users
             SET uploaded_bytes = uploaded_bytes + $1::bigint,
                 downloaded_bytes = downloaded_bytes + $2::bigint,
                 last_ip = $3::inet,
                 updated_at = now()
             WHERE id = $4`,
            [safeUploadedDelta.toString(), safeDownloadedDelta.toString(), ip, user.id],
          );

          await client.query(
            `INSERT INTO snatch_list (torrent_id, user_id, uploaded_bytes, downloaded_bytes, last_announce_at, completed_at)
             VALUES ($1, $2, $3::bigint, $4::bigint, now(), CASE WHEN $5::bigint = 0 THEN now() ELSE NULL END)
             ON CONFLICT (torrent_id, user_id) DO UPDATE SET
               uploaded_bytes = snatch_list.uploaded_bytes + EXCLUDED.uploaded_bytes,
               downloaded_bytes = snatch_list.downloaded_bytes + EXCLUDED.downloaded_bytes,
               last_announce_at = now(),
               completed_at = COALESCE(snatch_list.completed_at, EXCLUDED.completed_at)`,
            [torrent.id, user.id, safeUploadedDelta.toString(), safeDownloadedDelta.toString(), params.left.toString()],
          );
        }

        if (params.event === 'completed') {
          await client.query(
            `UPDATE torrents SET completed_count = completed_count + 1, updated_at = now() WHERE id = $1`,
            [torrent.id],
          );
        }

        await client.query(
          `INSERT INTO announce_events (torrent_id, user_id, info_hash_hex, ip, port, event, uploaded_delta, downloaded_delta, left_bytes, suspicious, reason)
           VALUES ($1, $2, $3, $4::inet, $5, $6, $7::bigint, $8::bigint, $9::bigint, $10, $11)`,
          [
            torrent.id,
            user.id,
            infoHashHex,
            ip,
            params.port,
            params.event ?? null,
            safeUploadedDelta.toString(),
            safeDownloadedDelta.toString(),
            params.left.toString(),
            suspicious,
            suspicious ? 'negative delta or unrealistic upload delta' : null,
          ],
        );

        const cutoffSeconds = ANNOUNCE_INTERVAL * 2;
        const peerRows = await client.query(
          `SELECT host(ip) AS ip, port
           FROM peers
           WHERE torrent_id = $1
             AND announced_at > now() - ($2::int * interval '1 second')
             AND NOT (user_id = $3 AND peer_id = decode($4, 'hex'))
           ORDER BY random()
           LIMIT $5`,
          [torrent.id, cutoffSeconds, user.id, peerIdHex, params.numwant],
        );
        const counts = await client.query(
          `SELECT COUNT(*) FILTER (WHERE seeder) AS complete,
                  COUNT(*) FILTER (WHERE NOT seeder) AS incomplete
           FROM peers
           WHERE torrent_id = $1 AND announced_at > now() - ($2::int * interval '1 second')`,
          [torrent.id, cutoffSeconds],
        );

        return { peerRows: peerRows.rows, counts: counts.rows[0], suspicious };
      });

      const body = params.compact
        ? {
            interval: ANNOUNCE_INTERVAL,
            'min interval': ANNOUNCE_MIN_INTERVAL,
            complete: Number(result.counts.complete ?? 0),
            incomplete: Number(result.counts.incomplete ?? 0),
            peers: compactPeers(result.peerRows),
          }
        : {
            interval: ANNOUNCE_INTERVAL,
            'min interval': ANNOUNCE_MIN_INTERVAL,
            complete: Number(result.counts.complete ?? 0),
            incomplete: Number(result.counts.incomplete ?? 0),
            peers: result.peerRows.map((p: { ip: string; port: number }) => ({ ip: p.ip, port: p.port })),
          };

      if (result.suspicious) {
        return res.send(bencode({ ...body, 'warning message': 'announce accepted but not credited; review required' }));
      }
      return res.send(bencode(body));
    } catch (error) {
      return res.send(failure(error instanceof Error ? error.message : 'announce failed'));
    }
  }
}

@Module({ controllers: [AppController] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }));
  await app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
    keyGenerator: (req: FastifyRequest) => clientIp(req),
  });
  app.enableCors({ origin: true });
  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
