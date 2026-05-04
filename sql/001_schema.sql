CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$ BEGIN
  CREATE TYPE user_class AS ENUM ('newbie', 'member', 'elite', 'vip', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE torrent_status AS ENUM ('pending', 'approved', 'dead', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username CITEXT NOT NULL UNIQUE,
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  passkey CHAR(64) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  class user_class NOT NULL DEFAULT 'newbie',
  uploaded_bytes BIGINT NOT NULL DEFAULT 0 CHECK (uploaded_bytes >= 0),
  downloaded_bytes BIGINT NOT NULL DEFAULT 0 CHECK (downloaded_bytes >= 0),
  bonus_points NUMERIC(18, 6) NOT NULL DEFAULT 0 CHECK (bonus_points >= 0),
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_download_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  invite_count INTEGER NOT NULL DEFAULT 0,
  last_ip INET,
  risk_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_ratio_safe CHECK (uploaded_bytes >= 0 AND downloaded_bytes >= 0)
);

CREATE INDEX IF NOT EXISTS idx_users_class_created_at ON users (class, created_at);
CREATE INDEX IF NOT EXISTS idx_users_ratio_scan ON users (downloaded_bytes, uploaded_bytes);

CREATE TABLE IF NOT EXISTS torrents (
  id BIGSERIAL PRIMARY KEY,
  info_hash BYTEA NOT NULL UNIQUE CHECK (octet_length(info_hash) = 20),
  info_hash_hex CHAR(40) GENERATED ALWAYS AS (encode(info_hash, 'hex')) STORED,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  file_count INTEGER NOT NULL DEFAULT 0 CHECK (file_count >= 0),
  uploader_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  status torrent_status NOT NULL DEFAULT 'pending',
  seeders INTEGER NOT NULL DEFAULT 0 CHECK (seeders >= 0),
  leechers INTEGER NOT NULL DEFAULT 0 CHECK (leechers >= 0),
  completed_count BIGINT NOT NULL DEFAULT 0 CHECK (completed_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_torrents_status_created_at ON torrents (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_torrents_category_status_created_at ON torrents (category, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_torrents_seeders ON torrents (seeders DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_torrents_info_hash_hex ON torrents (info_hash_hex);
CREATE INDEX IF NOT EXISTS idx_torrents_metadata_gin ON torrents USING GIN (metadata);

CREATE TABLE IF NOT EXISTS torrent_files (
  id BIGSERIAL PRIMARY KEY,
  torrent_id BIGINT NOT NULL REFERENCES torrents(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  ext TEXT GENERATED ALWAYS AS (lower(regexp_replace(path, '^.*\.', ''))) STORED
);

CREATE INDEX IF NOT EXISTS idx_torrent_files_torrent_id ON torrent_files (torrent_id);
CREATE INDEX IF NOT EXISTS idx_torrent_files_ext ON torrent_files (ext);
CREATE INDEX IF NOT EXISTS idx_torrent_files_path_trgm ON torrent_files USING GIN (path gin_trgm_ops);

CREATE TABLE IF NOT EXISTS peers (
  id BIGSERIAL PRIMARY KEY,
  torrent_id BIGINT NOT NULL REFERENCES torrents(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  peer_id BYTEA NOT NULL CHECK (octet_length(peer_id) = 20),
  ip INET NOT NULL,
  port INTEGER NOT NULL CHECK (port > 0 AND port <= 65535),
  user_agent TEXT,
  uploaded_abs BIGINT NOT NULL DEFAULT 0 CHECK (uploaded_abs >= 0),
  downloaded_abs BIGINT NOT NULL DEFAULT 0 CHECK (downloaded_abs >= 0),
  left_bytes BIGINT NOT NULL DEFAULT 0 CHECK (left_bytes >= 0),
  seeder BOOLEAN NOT NULL DEFAULT FALSE,
  connectable BOOLEAN,
  event TEXT,
  announced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (torrent_id, user_id, peer_id)
);

CREATE INDEX IF NOT EXISTS idx_peers_torrent_seeder ON peers (torrent_id, seeder);
CREATE INDEX IF NOT EXISTS idx_peers_user ON peers (user_id, announced_at DESC);
CREATE INDEX IF NOT EXISTS idx_peers_expire ON peers (announced_at);

CREATE TABLE IF NOT EXISTS snatch_list (
  id BIGSERIAL PRIMARY KEY,
  torrent_id BIGINT NOT NULL REFERENCES torrents(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  uploaded_bytes BIGINT NOT NULL DEFAULT 0 CHECK (uploaded_bytes >= 0),
  downloaded_bytes BIGINT NOT NULL DEFAULT 0 CHECK (downloaded_bytes >= 0),
  seed_time_seconds BIGINT NOT NULL DEFAULT 0 CHECK (seed_time_seconds >= 0),
  last_announce_at TIMESTAMPTZ,
  UNIQUE (torrent_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_snatch_user_completed ON snatch_list (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_snatch_torrent_completed ON snatch_list (torrent_id, completed_at DESC);

CREATE TABLE IF NOT EXISTS bonus_ledger (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  torrent_id BIGINT REFERENCES torrents(id) ON DELETE SET NULL,
  points NUMERIC(18, 6) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bonus_ledger_user_created ON bonus_ledger (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS announce_events (
  id BIGSERIAL PRIMARY KEY,
  torrent_id BIGINT,
  user_id BIGINT,
  info_hash_hex CHAR(40),
  ip INET,
  port INTEGER,
  event TEXT,
  uploaded_delta BIGINT NOT NULL DEFAULT 0,
  downloaded_delta BIGINT NOT NULL DEFAULT 0,
  left_bytes BIGINT,
  suspicious BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announce_events_user_time ON announce_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announce_events_suspicious_time ON announce_events (suspicious, created_at DESC);

-- Dev demo data: passkey is 64 chars. Replace password_hash in real app.
INSERT INTO users (username, email, password_hash, class, uploaded_bytes, downloaded_bytes, passkey)
VALUES ('demo', 'demo@example.test', 'dev-only-hash', 'member', 10737418240, 2147483648, '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
ON CONFLICT DO NOTHING;

-- A legal public-domain test torrent record. info_hash is dummy bytes for local testing.
INSERT INTO torrents (info_hash, name, category, size_bytes, file_count, uploader_id, status, approved_at, metadata)
SELECT decode('1111111111111111111111111111111111111111', 'hex'), 'Sandbox Ubuntu ISO mirror test', 'linux', 1024 * 1024 * 128, 1, u.id, 'approved', now(), '{"license":"test/public-domain-placeholder"}'::jsonb
FROM users u WHERE u.username = 'demo'
ON CONFLICT DO NOTHING;
