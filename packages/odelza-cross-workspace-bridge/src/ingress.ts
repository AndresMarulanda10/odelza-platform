import { allowedProjectionFields } from './projection';

export const MAX_BODY_BYTES = 64 * 1024;
const SUPPORTED_EVENTS = new Set(
  'created updated deleted restored upserted'.split(' '),
);
export type NormalizedBridgeMessage = {
  schemaVersion: 1;
  sourceWorkspaceKey: string;
  deliveryId: string;
  timestamp: string;
  eventId: string;
  eventName: string;
  objectId: string;
  objectName: string;
  recordId: string;
  updatedFields: string[];
  sourceFields: Record<string, unknown>;
  workspaceRole: 'source' | 'destination';
  mutationId?: string;
  shareRequested?: boolean;
};
type IngressEnvironment = {
  BRIDGE_HMAC_SECRET: string;
  BRIDGE_SOURCE_WORKSPACE_KEY: string;
  BRIDGE_QUEUE: Pick<Queue<NormalizedBridgeMessage>, 'send'>;
};
type JsonRecord = Record<string, unknown>;
export const handleIngress = async (
  request: Request,
  env: IngressEnvironment,
  now = Date.now(),
): Promise<Response> => {
  if (request.method !== 'POST') return jsonResponse('not_found', 404);
  if (
    request.headers.get('content-type')?.split(';')[0].trim() !==
    'application/json'
  ) {
    return jsonResponse('invalid_content_type', 400);
  }
  const timestamp = request.headers.get('X-Twenty-Webhook-Timestamp');
  const nonce = request.headers.get('X-Twenty-Webhook-Nonce');
  const signature = request.headers.get('X-Twenty-Webhook-Signature');
  if (
    !timestamp ||
    !nonce ||
    !signature ||
    !isValidNonce(nonce) ||
    !isFreshTimestamp(timestamp, now)
  ) {
    return jsonResponse('unauthorized', 401);
  }
  const declaredLength = request.headers.get('content-length');
  if (
    declaredLength &&
    (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)
  ) {
    return jsonResponse('body_too_large', 413);
  }
  const rawBody = await readBoundedBody(request);
  if (!rawBody) return jsonResponse('body_too_large', 413);
  if (!env.BRIDGE_HMAC_SECRET || !env.BRIDGE_SOURCE_WORKSPACE_KEY) {
    return jsonResponse('service_unavailable', 503);
  }
  if (
    !(await verifySignature(
      env.BRIDGE_HMAC_SECRET,
      timestamp,
      nonce,
      rawBody,
      signature,
    ))
  ) {
    return jsonResponse('unauthorized', 401);
  }
  let body: unknown;
  try {
    body = JSON.parse(
      new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(
        rawBody,
      ),
    );
  } catch {
    return jsonResponse('invalid_json', 400);
  }
  if (!isRecord(body)) {
    return jsonResponse('unauthorized', 401);
  }
  const declaredSourceWorkspaceKey =
    body.sourceWorkspaceKey ?? body.workspaceKey;
  if (
    declaredSourceWorkspaceKey !== undefined &&
    getString(declaredSourceWorkspaceKey) !== env.BRIDGE_SOURCE_WORKSPACE_KEY
  ) {
    return jsonResponse('unauthorized', 401);
  }
  const message = normalizeEnvelope(
    body,
    timestamp,
    env.BRIDGE_SOURCE_WORKSPACE_KEY,
  );
  if (!message) return jsonResponse('invalid_envelope', 400);
  try {
    await env.BRIDGE_QUEUE.send(message);
  } catch {
    return jsonResponse('service_unavailable', 503);
  }
  return jsonResponse('accepted', 202);
};
const normalizeEnvelope = (
  value: JsonRecord,
  timestamp: string,
  configuredSourceWorkspaceKey: string,
): NormalizedBridgeMessage | undefined => {
  if (value.schemaVersion !== undefined && value.schemaVersion !== 1)
    return undefined;
  const sourceWorkspaceKey = getString(
    value.sourceWorkspaceKey ??
      value.workspaceKey ??
      configuredSourceWorkspaceKey,
  );
  const deliveryId = getIdentifier(value.deliveryId);
  const eventId = getIdentifier(
    value.eventId ?? value.deliveryId ?? value.webhookId,
  );
  const eventName = getString(value.eventName);
  const metadata = isRecord(value.objectMetadata) ? value.objectMetadata : {};
  const objectName = getString(value.objectName ?? metadata.nameSingular);
  const objectId = getIdentifier(value.objectId ?? metadata.id);
  const record = isRecord(value.record) ? value.record : {};
  const recordId = getIdentifier(value.recordId ?? record.id);
  const updatedFields = normalizeUpdatedFields(value.updatedFields);
  const sourceFields = normalizeSourceFields(record, objectName);
  const workspaceRole = value.workspaceRole ?? 'source';
  const mutationId = getIdentifier(value.mutationId);
  const shareRequested = value.shareRequested === true;
  if (
    !sourceWorkspaceKey ||
    !isIdentifier(sourceWorkspaceKey) ||
    !deliveryId ||
    !eventId ||
    !eventName ||
    !objectName ||
    !objectId ||
    !recordId ||
    !updatedFields ||
    !sourceFields ||
    (workspaceRole !== 'source' && workspaceRole !== 'destination')
  )
    return undefined;
  const [eventObject, eventType, extra] = eventName.split('.');
  if (
    extra ||
    eventObject !== objectName ||
    !eventType ||
    !SUPPORTED_EVENTS.has(eventType)
  )
    return undefined;
  return {
    schemaVersion: 1,
    sourceWorkspaceKey,
    deliveryId,
    timestamp,
    eventId,
    eventName,
    objectId,
    objectName,
    recordId,
    updatedFields,
    sourceFields,
    workspaceRole,
    ...(mutationId ? { mutationId } : {}),
    ...(shareRequested ? { shareRequested } : {}),
  };
};
const normalizeUpdatedFields = (value: unknown): string[] | undefined => {
  if (value === undefined) return [];
  return Array.isArray(value) && value.every(isValidField) ? value : undefined;
};
const normalizeSourceFields = (
  record: JsonRecord,
  objectName: string | undefined,
): Record<string, unknown> | undefined => {
  if (!objectName) return undefined;
  return Object.fromEntries(
    allowedProjectionFields(objectName)
      .filter((field) => field in record)
      .map((field) => [field, record[field]]),
  );
};
const isValidField = (value: unknown): value is string =>
  typeof value === 'string' && isIdentifier(value);
const readBoundedBody = async (
  request: Request,
): Promise<Uint8Array | undefined> => {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      // oxlint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        // oxlint-disable-next-line no-await-in-loop
        await reader.cancel();
        return undefined;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  // @ts-expect-error Cloudflare's stream chunk type is a valid BlobPart at runtime.
  return new Uint8Array(await new Blob(chunks).arrayBuffer());
};
const verifySignature = async (
  secret: string,
  timestamp: string,
  nonce: string,
  rawBody: Uint8Array,
  providedSignature: string,
): Promise<boolean> => {
  if (!/^[a-f\d]{64}$/i.test(providedSignature)) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  );
  const prefix = new TextEncoder().encode(`${timestamp}:${nonce}:`);
  const canonical = Uint8Array.from([...prefix, ...rawBody]);
  const expected = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, canonical),
  );
  // @ts-expect-error Cloudflare provides this runtime extension outside the generated DOM type.
  return crypto.subtle.timingSafeEqual(expected, hexToBytes(providedSignature));
};
const hexToBytes = (value: string): Uint8Array =>
  Uint8Array.from({ length: value.length / 2 }, (_, index) =>
    Number.parseInt(value.slice(index * 2, index * 2 + 2), 16),
  );
const isFreshTimestamp = (value: string, now: number): boolean =>
  /^\d{1,16}$/.test(value) &&
  Number.isSafeInteger(Number(value)) &&
  Math.abs(now - Number(value)) <= 5 * 60 * 1_000;
const isValidNonce = (value: string): boolean =>
  value.length >= 8 && value.length <= 128 && /^[A-Za-z0-9._~-]+$/.test(value);
const getIdentifier = (value: unknown): string | undefined =>
  typeof value === 'string' && isIdentifier(value) ? value : undefined;
const isIdentifier = (value: string): boolean =>
  value.length <= 128 && /^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(value);
const getString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;
const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const jsonResponse = (error: string, status: number): Response =>
  Response.json({ error }, { status });
