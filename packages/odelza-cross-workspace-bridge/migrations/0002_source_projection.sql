ALTER TABLE bridge_pending_events ADD COLUMN source_fields_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE bridge_pending_events ADD COLUMN projection_key TEXT;
ALTER TABLE bridge_pending_events ADD COLUMN destination_record_id TEXT;
ALTER TABLE bridge_pending_events ADD COLUMN blocked_reason TEXT;
ALTER TABLE bridge_pending_events ADD COLUMN projected_at TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS bridge_pending_events_projection_key_idx
  ON bridge_pending_events (projection_key);
