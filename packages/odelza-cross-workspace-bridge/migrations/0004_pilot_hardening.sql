CREATE TABLE IF NOT EXISTS bridge_shared_file_digests (
  file_key TEXT PRIMARY KEY NOT NULL, digest TEXT NOT NULL, destination_key TEXT NOT NULL,
  mutation_id TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('pending', 'projected')),
  created_at TEXT NOT NULL
); CREATE TABLE IF NOT EXISTS bridge_dead_letters (
  dead_letter_id TEXT PRIMARY KEY NOT NULL, delivery_id TEXT NOT NULL, body_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'replayed')), attempts INTEGER NOT NULL,
  created_at TEXT NOT NULL, replayed_at TEXT
);
