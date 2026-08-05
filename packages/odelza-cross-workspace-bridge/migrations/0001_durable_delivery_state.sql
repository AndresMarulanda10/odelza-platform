CREATE TABLE IF NOT EXISTS bridge_delivery_receipts (
  delivery_id TEXT PRIMARY KEY NOT NULL, source_workspace_key TEXT NOT NULL,
  event_id TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('pending', 'projected', 'failed')), received_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS bridge_pending_events (
  delivery_id TEXT PRIMARY KEY NOT NULL REFERENCES bridge_delivery_receipts(delivery_id), schema_version INTEGER NOT NULL, source_workspace_key TEXT NOT NULL,
  event_id TEXT NOT NULL, received_timestamp TEXT NOT NULL, event_name TEXT NOT NULL, object_name TEXT NOT NULL, object_id TEXT NOT NULL, record_id TEXT NOT NULL,
  updated_fields_json TEXT NOT NULL, projection_status TEXT NOT NULL CHECK (projection_status IN ('pending', 'projected', 'blocked')), created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS bridge_pending_events_projection_idx ON bridge_pending_events (projection_status, created_at);
