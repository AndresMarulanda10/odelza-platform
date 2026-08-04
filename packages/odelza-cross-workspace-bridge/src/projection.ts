import type { NormalizedBridgeMessage } from './ingress';

const RULES: Record<string, readonly string[]> = {
  company: ['name'],
  project: ['name'],
  task: ['title', 'status', 'dueAt', 'progress'],
};
const PLACEHOLDER_DESTINATION = 'destination-placeholder';

export type ProjectionValue = string | number | null;
export type SourceProjection = {
  projectionKey: string;
  destinationKey: string;
  sourceWorkspaceKey: string;
  sourceRecordId: string;
  objectName: string;
  fields: Record<string, ProjectionValue>;
  authority: 'source';
};
export type ProjectionDecision =
  | SourceProjection
  | { status: 'blocked'; reason: string };
export type DestinationAdapter = {
  destinationKey: string;
  publish: (
    projection: SourceProjection,
  ) => Promise<{ destinationRecordId: string }>;
};
export const allowedProjectionFields = (
  objectName: string,
): readonly string[] => RULES[objectName] ?? [];

export const projectSourceEvent = (
  event: NormalizedBridgeMessage,
  destinationKey = PLACEHOLDER_DESTINATION,
): ProjectionDecision => {
  const allowed = allowedProjectionFields(event.objectName);
  if (allowed.length === 0)
    return { status: 'blocked', reason: 'unsupported_object' };
  if (event.eventName.endsWith('.deleted'))
    return { status: 'blocked', reason: 'delete_not_propagated' };

  const sourceKeys = Object.keys(event.sourceFields);
  const unsupported = [...event.updatedFields, ...sourceKeys].filter(
    (field) => !allowed.includes(field),
  );
  if (unsupported.length > 0)
    return { status: 'blocked', reason: `unsupported_field:${unsupported[0]}` };

  const selected = event.updatedFields.length
    ? allowed.filter((field) => event.updatedFields.includes(field))
    : allowed.filter((field) => sourceKeys.includes(field));
  const fields: Record<string, ProjectionValue> = {};
  for (const field of selected) {
    const value = event.sourceFields[field];
    if (!(field in event.sourceFields))
      return { status: 'blocked', reason: `missing_source_field:${field}` };
    const invalid = invalidProjectionField(field, value);
    if (invalid) return { status: 'blocked', reason: invalid };
    if (!isProjectionValue(value))
      return { status: 'blocked', reason: `invalid_source_field:${field}` };
    fields[field] = value;
  }
  if (event.objectName !== 'task' && typeof fields.name !== 'string')
    return { status: 'blocked', reason: 'missing_source_field:name' };
  if (event.objectName === 'task' && selected.length === 0)
    return { status: 'blocked', reason: 'no_approved_source_fields' };

  return {
    projectionKey: [
      destinationKey,
      event.sourceWorkspaceKey,
      event.objectName,
      event.recordId,
      event.eventId,
    ].join(':'),
    destinationKey,
    sourceWorkspaceKey: event.sourceWorkspaceKey,
    sourceRecordId: event.recordId,
    objectName: event.objectName,
    fields,
    authority: 'source',
  };
};

const isProjectionValue = (value: unknown): value is ProjectionValue =>
  value === null || typeof value === 'string' || typeof value === 'number';
const invalidProjectionField = (
  field: string,
  value: unknown,
): string | undefined => {
  const validString =
    (field === 'title' || field === 'name') && typeof value === 'string';
  const nullableString =
    (field === 'status' || field === 'dueAt') &&
    (value === null || typeof value === 'string');
  const validProgress =
    field === 'progress' && typeof value === 'number' && Number.isFinite(value);
  return (validString || nullableString || validProgress) &&
    isProjectionValue(value)
    ? undefined
    : `invalid_source_field:${field}`;
};
