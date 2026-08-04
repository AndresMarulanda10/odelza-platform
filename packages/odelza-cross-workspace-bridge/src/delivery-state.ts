import type { NormalizedBridgeMessage } from './ingress';

const SUPPORTED_OBJECTS = new Set('company project task note'.split(' '));
const SUPPORTED_EVENTS = new Set(
  'created updated deleted restored upserted'.split(' '),
);
export class TransientDeliveryStorageError extends Error {
  constructor(cause: unknown) {
    super('bridge delivery storage failed', { cause });
    this.name = 'TransientDeliveryStorageError';
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
    !value.updatedFields.every(isNonEmptyString)
  )
    return false;
  const [eventObject, eventType, extra] = eventName.split('.');

  return (
    !extra &&
    eventObject === objectName &&
    SUPPORTED_OBJECTS.has(objectName) &&
    eventType !== undefined &&
    SUPPORTED_EVENTS.has(eventType)
  );
};

export const persistNormalizedEvent = async (
  database: D1Database,
  event: NormalizedBridgeMessage,
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
          "INSERT OR IGNORE INTO bridge_pending_events (delivery_id, schema_version, source_workspace_key, event_id, received_timestamp, event_name, object_name, object_id, record_id, updated_fields_json, projection_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)",
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
): Promise<void> => {
  if (!isNormalizedBridgeMessage(message.body))
    throw new Error('bridge queue message is malformed or unsupported');

  try {
    await persistNormalizedEvent(database, message.body);
    message.ack();
  } catch (error) {
    if (error instanceof TransientDeliveryStorageError) {
      message.retry();
      return;
    }

    throw error;
  }
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
