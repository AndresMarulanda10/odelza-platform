import type { NormalizedBridgeMessage } from './ingress';
import type { SharedFile, SharedFileDescriptor } from './shared-files';

const RULES: Record<string, readonly string[]> = {
  company: ['name'],
  project: ['name'],
  task: ['title', 'status', 'dueAt', 'progress'],
  note: ['title', 'body'],
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
  authority: 'source' | 'managed';
  direction: 'to-destination' | 'to-source';
  mutationId: string;
  revision: number;
  sharedFiles: SharedFileDescriptor[];
};
export type ProjectionDecision =
  | SourceProjection
  | { status: 'blocked'; reason: string };
export type DestinationAdapter = {
  destinationKey: string;
  config: { apiUrl: string; apiKey: string; scopes: readonly string[] };
  publish: (
    projection: SourceProjection,
    files?: SharedFile[],
  ) => Promise<{ destinationRecordId: string }>;
};
export const validateDestinationAdapterConfig = (config: {
  apiUrl: string;
  apiKey: string;
  scopes: readonly string[];
}): string | undefined =>
  config.apiUrl.startsWith('https://') &&
  Boolean(config.apiKey) &&
  config.scopes.join(',') === 'records:read,records:write,files:write'
    ? undefined
    : 'destination_config_invalid';
export const validateCredentialRotation = (current: string, next: string) =>
  !current || !next || current === next
    ? 'credential_rotation_invalid'
    : undefined;
export const allowedProjectionFields = (
  objectName: string,
): readonly string[] => RULES[objectName] ?? [];

export const projectSourceEvent = (
  event: NormalizedBridgeMessage,
  destinationKey = PLACEHOLDER_DESTINATION,
  options: {
    conflictingFields?: readonly string[];
    revision?: number;
  } = {},
): ProjectionDecision => {
  const allowed = allowedProjectionFields(event.objectName);
  if (allowed.length === 0)
    return { status: 'blocked', reason: 'unsupported_object' };
  if (event.eventName.endsWith('.deleted'))
    return { status: 'blocked', reason: 'delete_not_propagated' };
  if (
    (event.objectName === 'company' || event.objectName === 'project') &&
    event.workspaceRole === 'destination'
  )
    return { status: 'blocked', reason: 'source_authoritative_object' };
  if (event.objectName === 'note' && !event.shareRequested)
    return { status: 'blocked', reason: 'note_share_required' };
  if (event.objectName === 'note' && event.workspaceRole === 'destination')
    return { status: 'blocked', reason: 'note_source_only' };
  if (event.sharedFiles && !event.shareRequested)
    return { status: 'blocked', reason: 'shared_files_share_required' };
  if (options.conflictingFields?.length)
    return {
      status: 'blocked',
      reason: `same_field_conflict:${options.conflictingFields[0]}`,
    };

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
  if (
    event.objectName !== 'task' &&
    event.objectName !== 'note' &&
    typeof fields.name !== 'string'
  )
    return { status: 'blocked', reason: 'missing_source_field:name' };
  if (
    (event.objectName === 'task' || event.objectName === 'note') &&
    selected.length === 0
  )
    return { status: 'blocked', reason: 'no_approved_source_fields' };

  const direction =
    event.workspaceRole === 'destination' ? 'to-source' : 'to-destination';
  const projectionKey = [
    destinationKey,
    event.sourceWorkspaceKey,
    event.objectName,
    event.recordId,
    event.eventId,
  ].join(':');

  return {
    projectionKey,
    destinationKey,
    sourceWorkspaceKey: event.sourceWorkspaceKey,
    sourceRecordId: event.recordId,
    objectName: event.objectName,
    fields,
    authority:
      event.objectName === 'company' || event.objectName === 'project'
        ? 'source'
        : 'managed',
    direction,
    mutationId:
      event.mutationId ??
      `bridge:${direction}:${destinationKey}:${event.eventId}`,
    revision: options.revision ?? 0,
    sharedFiles: event.sharedFiles ?? [],
  };
};

const isProjectionValue = (value: unknown): value is ProjectionValue =>
  value === null || typeof value === 'string' || typeof value === 'number';
const invalidProjectionField = (
  field: string,
  value: unknown,
): string | undefined => {
  const validString =
    (field === 'title' || field === 'name' || field === 'body') &&
    typeof value === 'string';
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
