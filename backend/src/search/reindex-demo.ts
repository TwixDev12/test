import { MeiliSearch } from 'meilisearch';
import { pool } from '../db';

async function main() {
  const meili = new MeiliSearch({
    host: process.env.MEILI_HOST ?? 'http://localhost:7700',
    apiKey: process.env.MEILI_MASTER_KEY ?? 'dev_master_key_change_me',
  });

  const index = meili.index('torrents');
  await index.updateSettings({
    searchableAttributes: ['name', 'description', 'category', 'files'],
    filterableAttributes: ['category', 'status', 'size_bytes', 'created_at'],
    sortableAttributes: ['created_at', 'size_bytes', 'seeders', 'leechers', 'completed_count'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    synonyms: {
      'ubuntu': ['linux', 'iso'],
      'doc': ['document', 'pdf'],
      'vf': ['francais', 'français'],
      'vostfr': ['sous-titres français', 'sub french'],
    },
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: { oneTypo: 5, twoTypos: 9 },
    },
  });

  const { rows } = await pool.query(`
    SELECT
      t.id,
      t.info_hash_hex,
      t.name,
      t.description,
      t.category,
      t.status,
      t.size_bytes,
      t.seeders,
      t.leechers,
      t.completed_count,
      t.created_at,
      COALESCE(json_agg(tf.path ORDER BY tf.path) FILTER (WHERE tf.id IS NOT NULL), '[]') AS files
    FROM torrents t
    LEFT JOIN torrent_files tf ON tf.torrent_id = t.id
    WHERE t.status = 'approved'
    GROUP BY t.id
    ORDER BY t.id
  `);

  await index.addDocuments(rows, { primaryKey: 'id' });
  console.log(`Indexed ${rows.length} torrents`);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
