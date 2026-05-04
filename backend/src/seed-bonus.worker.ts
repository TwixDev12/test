import { pool } from './db';

const POINTS_PER_HOUR = Number(process.env.SEED_POINTS_PER_HOUR ?? 0.25);

async function tick() {
  const { rows } = await pool.query(`
    WITH active_seeders AS (
      SELECT DISTINCT p.user_id, p.torrent_id
      FROM peers p
      JOIN torrents t ON t.id = p.torrent_id
      WHERE p.seeder = true
        AND p.announced_at > now() - interval '45 minutes'
        AND t.status = 'approved'
    ), credited AS (
      INSERT INTO bonus_ledger (user_id, torrent_id, points, reason)
      SELECT user_id, torrent_id, $1::numeric / 2.0, 'active seeding 30-minute tick'
      FROM active_seeders
      RETURNING user_id, points
    )
    UPDATE users u
    SET bonus_points = bonus_points + c.total_points,
        updated_at = now()
    FROM (
      SELECT user_id, SUM(points) AS total_points
      FROM credited
      GROUP BY user_id
    ) c
    WHERE u.id = c.user_id
    RETURNING u.id, c.total_points
  `, [POINTS_PER_HOUR]);

  console.log(`Seed bonus credited to ${rows.length} users`);
}

tick().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
