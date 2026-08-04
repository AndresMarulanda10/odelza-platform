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
  if (
    (value.workspaceRole !== 'source' &&
      value.workspaceRole !== 'destination') ||
    (value.mutationId !== undefined && !isNonEmptyString(value.mutationId)) ||
    (value.shareRequested !== undefined &&
      typeof value.shareRequested !== 'boolean')
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
          "INSERT OR IGNORE INTO bridge_pending_events (delivery_id, schema_version, source_workspace_key, event_id, received_timestamp, event_name, object_name, object_id, record_id, updated_fields_json, source_fields_json, projection_key, projection_status, created_at, workspace_role, mutation_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)",
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
          event.workspaceRole,
          event.mutationId ?? null,
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
type FieldRevisionRow = {
  field_name: string;
  revision: number;
  last_event_timestamp: string;
  last_workspace_role: 'source' | 'destination';
  last_mutation_id: string;
  value_json: string;
};

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

    if (event.mutationId) {
      const mutation = await database
        .prepare('SELECT status FROM bridge_mutations WHERE mutation_id = ?')
        .bind(event.mutationId)
        .first<{ status: string }>();
      if (mutation?.status === 'applied') {
        await markProjected(database, event.deliveryId);
        return;
      }
    }
    const revisionResult = await database
      .prepare(
        'SELECT field_name, revision, last_event_timestamp, last_workspace_role, last_mutation_id, value_json FROM bridge_field_revisions WHERE destination_key = ? AND source_workspace_key = ? AND object_name = ? AND record_id = ?',
      )
      .bind(
        adapter.destinationKey,
        event.sourceWorkspaceKey,
        event.objectName,
        event.recordId,
      )
      .all<FieldRevisionRow>();
    const revisions = new Map(
      revisionResult.results.map((revision) => [revision.field_name, revision]),
    );
    const conflictingFields = event.updatedFields.filter((field) => {
      const previous = revisions.get(field);
      return (
        previous &&
        previous.last_workspace_role !== event.workspaceRole &&
        compareEventTimestamps(
          event.timestamp,
          previous.last_event_timestamp,
        ) <= 0
      );
    });
    const revision =
      Math.max(
        0,
        ...revisionResult.results.map((revisionRow) => revisionRow.revision),
      ) + 1;
    const decision = projectSourceEvent(event, adapter.destinationKey, {
      conflictingFields,
      revision,
    });
    if ('status' in decision) {
      await markBlocked(
        database,
        event.deliveryId,
        decision.reason,
        event,
        adapter.destinationKey,
        revisions,
      );
      return;
    }
    await database
      .prepare(
        "INSERT OR IGNORE INTO bridge_mutations (mutation_id, projection_key, status, created_at) VALUES (?, ?, 'pending', ?)",
      )
      .bind(
        decision.mutationId,
        decision.projectionKey,
        new Date().toISOString(),
      )
      .run();
    if (event.objectName === 'note') {
      await database
        .prepare(
          "INSERT OR IGNORE INTO bridge_note_shares (share_key, source_workspace_key, source_record_id, destination_key, mutation_id, status, created_at) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
        )
        .bind(
          decision.projectionKey,
          event.sourceWorkspaceKey,
          event.recordId,
          adapter.destinationKey,
          decision.mutationId,
          new Date().toISOString(),
        )
        .run();
    }
    const result = await adapter.publish(decision);
    await database.batch([
      database
        .prepare(
          "UPDATE bridge_mutations SET status = 'applied' WHERE mutation_id = ?",
        )
        .bind(decision.mutationId),
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
      ...Object.entries(decision.fields).map(([field, value]) =>
        database
          .prepare(
            'INSERT INTO bridge_field_revisions (field_key, destination_key, source_workspace_key, object_name, record_id, field_name, revision, last_event_timestamp, last_workspace_role, last_mutation_id, value_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(field_key) DO UPDATE SET revision = excluded.revision, last_event_timestamp = excluded.last_event_timestamp, last_workspace_role = excluded.last_workspace_role, last_mutation_id = excluded.last_mutation_id, value_json = excluded.value_json, updated_at = excluded.updated_at',
          )
          .bind(
            fieldKey(adapter.destinationKey, event, field),
            adapter.destinationKey,
            event.sourceWorkspaceKey,
            event.objectName,
            event.recordId,
            field,
            revision,
            event.timestamp,
            event.workspaceRole,
            decision.mutationId,
            JSON.stringify(value),
            new Date().toISOString(),
          ),
      ),
      ...(event.objectName === 'note'
        ? [
            database
              .prepare(
                "UPDATE bridge_note_shares SET status = 'projected' WHERE share_key = ?",
              )
              .bind(decision.projectionKey),
          ]
        : []),
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
  event: NormalizedBridgeMessage,
  destinationKey: string,
  revisions: Map<string, FieldRevisionRow>,
): Promise<void> => {
  const field = reason.startsWith('same_field_conflict:')
    ? reason.slice('same_field_conflict:'.length)
    : undefined;
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
    ...(field
      ? [
          database
            .prepare(
              "INSERT OR IGNORE INTO bridge_conflicts (conflict_key, field_key, event_id, existing_mutation_id, incoming_value_json, existing_value_json, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'blocked', ?)",
            )
            .bind(
              `${fieldKey(destinationKey, event, field)}:${event.eventId}`,
              fieldKey(destinationKey, event, field),
              event.eventId,
              revisions.get(field)?.last_mutation_id ?? 'unknown',
              JSON.stringify(event.sourceFields[field]),
              revisions.get(field)?.value_json ?? 'null',
              new Date().toISOString(),
            ),
        ]
      : []),
  ]);
};

const markProjected = async (
  database: D1Database,
  deliveryId: string,
): Promise<void> => {
  await database.batch([
    database
      .prepare(
        "UPDATE bridge_pending_events SET projection_status = 'projected', blocked_reason = 'loop_suppressed' WHERE delivery_id = ?",
      )
      .bind(deliveryId),
    database
      .prepare(
        "UPDATE bridge_delivery_receipts SET status = 'projected' WHERE delivery_id = ?",
      )
      .bind(deliveryId),
  ]);
};

const fieldKey = (
  destinationKey: string,
  event: NormalizedBridgeMessage,
  field: string,
): string =>
  [
    destinationKey,
    event.sourceWorkspaceKey,
    event.objectName,
    event.recordId,
    field,
  ].join(':');
const compareEventTimestamps = (left: string, right: string): number => {
  const leftNumber = Number(left);
  const rightNumber = Number(right);
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber))
    return leftNumber - rightNumber;
  return left.localeCompare(right);
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
