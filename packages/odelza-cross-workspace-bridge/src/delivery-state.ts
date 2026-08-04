import type { NormalizedBridgeMessage } from './ingress';
import { type DestinationAdapter, projectSourceEvent } from './projection';

const SUPPORTED_EVENTS = new Set(
  'created updated deleted restored upserted'.split(' '),
);
export class TransientDeliveryStorageError extends Error {
  constructor(cause: unknown) {
    super('bridge delivery storage failed', { cause });
    this.name = 'TransientDeliveryStorageError';
  }
}
export class TransientProjectionError extends Error {
  constructor(cause: unknown) {
    super('bridge projection failed', { cause });
    this.name = 'TransientProjectionError';
  }
}

export const isNormalizedBridgeMessage = (
  value: unknown,
): value is NormalizedBridgeMessage => {
  if (!isRecord(value) || value.schemaVersion !== 1) return false;

  const eventName = value.eventName;
  const objectName = value.objectName;
  if (
    !isNonEmptyString(eventName) ||
    !isNonEmptyString(objectName) ||
    ![
      value.sourceWorkspaceKey,
      value.deliveryId,
      value.timestamp,
      value.eventId,
      value.objectId,
      value.recordId,
    ].every(isNonEmptyString)
  ) {
    return false;
  }
  if (
    !Array.isArray(value.updatedFields) ||
    !value.updatedFields.every(isNonEmptyString) ||
    !isRecord(value.sourceFields)
  )
    return false;
  const [eventObject, eventType, extra] = eventName.split('.');

  return (
    !extra &&
    eventObject === objectName &&
    eventType !== undefined &&
    SUPPORTED_EVENTS.has(eventType) &&
    isNonEmptyString(objectName)
  );
};

export const persistNormalizedEvent = async (
  database: D1Database,
  event: NormalizedBridgeMessage,
  destinationKey = 'destination-placeholder',
  receivedAt = new Date().toISOString(),
): Promise<boolean> => {
  try {
    const results = await database.batch([
      database
        .prepare(
          "INSERT OR IGNORE INTO bridge_delivery_receipts (delivery_id, source_workspace_key, event_id, status, received_at) VALUES (?, ?, ?, 'pending', ?)",
        )
        .bind(
          event.deliveryId,
          event.sourceWorkspaceKey,
          event.eventId,
          receivedAt,
        ),
      database
        .prepare(
          "INSERT OR IGNORE INTO bridge_pending_events (delivery_id, schema_version, source_workspace_key, event_id, received_timestamp, event_name, object_name, object_id, record_id, updated_fields_json, source_fields_json, projection_key, projection_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)",
        )
        .bind(
          event.deliveryId,
          event.schemaVersion,
          event.sourceWorkspaceKey,
          event.eventId,
          event.timestamp,
          event.eventName,
          event.objectName,
          event.objectId,
          event.recordId,
          JSON.stringify(event.updatedFields),
          JSON.stringify(event.sourceFields),
          [
            destinationKey,
            event.sourceWorkspaceKey,
            event.objectName,
            event.recordId,
            event.eventId,
          ].join(':'),
          receivedAt,
        ),
    ]);

    return results[0].meta.changes === 1;
  } catch (error) {
    throw new TransientDeliveryStorageError(error);
  }
};

export const processDeliveryMessage = async (
  message: QueueMessage<unknown>,
  database: D1Database,
  adapter?: DestinationAdapter,
): Promise<void> => {
  if (!isNormalizedBridgeMessage(message.body))
    throw new Error('bridge queue message is malformed or unsupported');

  try {
    await persistNormalizedEvent(
      database,
      message.body,
      adapter?.destinationKey,
    );
    if (adapter) await projectPendingEvent(database, message.body, adapter);
    message.ack();
  } catch (error) {
    if (
      error instanceof TransientDeliveryStorageError ||
      error instanceof TransientProjectionError
    ) {
      message.retry();
      return;
    }

    throw error;
  }
};

type ProjectionRow = { projection_status: string };

export const projectPendingEvent = async (
  database: D1Database,
  event: NormalizedBridgeMessage,
  adapter: DestinationAdapter,
): Promise<void> => {
  try {
    const row = await database
      .prepare(
        'SELECT projection_status FROM bridge_pending_events WHERE delivery_id = ?',
      )
      .bind(event.deliveryId)
      .first<ProjectionRow>();
    if (row?.projection_status !== 'pending') return;

    const decision = projectSourceEvent(event, adapter.destinationKey);
    if ('status' in decision) {
      await markBlocked(database, event.deliveryId, decision.reason);
      return;
    }
    const result = await adapter.publish(decision);
    await database.batch([
      database
        .prepare(
          "UPDATE bridge_pending_events SET projection_status = 'projected', destination_record_id = ?, projected_at = ? WHERE delivery_id = ? AND projection_status = 'pending'",
        )
        .bind(
          result.destinationRecordId,
          new Date().toISOString(),
          event.deliveryId,
        ),
      database
        .prepare(
          "UPDATE bridge_delivery_receipts SET status = 'projected' WHERE delivery_id = ?",
        )
        .bind(event.deliveryId),
    ]);
  } catch (error) {
    if (error instanceof TransientProjectionError) throw error;
    throw new TransientProjectionError(error);
  }
};

const markBlocked = async (
  database: D1Database,
  deliveryId: string,
  reason: string,
): Promise<void> => {
  await database.batch([
    database
      .prepare(
        "UPDATE bridge_pending_events SET projection_status = 'blocked', blocked_reason = ? WHERE delivery_id = ? AND projection_status = 'pending'",
      )
      .bind(reason, deliveryId),
    database
      .prepare(
        "UPDATE bridge_delivery_receipts SET status = 'failed' WHERE delivery_id = ?",
      )
      .bind(deliveryId),
  ]);
};

type QueueMessage<T> = {
  body: T;
  ack: () => void;
  retry: () => void;
};
type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;
