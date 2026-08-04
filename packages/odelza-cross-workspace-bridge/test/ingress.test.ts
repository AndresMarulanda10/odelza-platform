import { describe, expect, it, vi } from 'vitest';
import { MAX_BODY_BYTES, handleIngress } from '../src/ingress';
const NOW = 1_754_053_200_000;
const SECRET = 'bridge-hmac-secret';
const WORKSPACE_KEY = 'source-team';
const envelope = {
  schemaVersion: 1,
  workspaceId: 'workspace-id',
  deliveryId: 'delivery-1',
  eventId: 'event-1',
  eventName: 'task.updated',
  objectId: 'task-object-1',
  objectName: 'task',
  recordId: 'record-1',
  updatedFields: ['title', 'status'],
  record: { id: 'record-1', title: 'must not reach the queue' },
};
const sign = async (timestamp: string, nonce: string, body: string) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${timestamp}:${nonce}:${body}`),
  );
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};
const request = async (
  body: unknown = envelope,
  options: Record<string, string> = {},
) => {
  const rawBody = JSON.stringify(body);
  const timestamp = options.timestamp ?? String(NOW);
  const nonce = options.nonce ?? 'nonce-01';
  return new Request('https://bridge.test/webhooks/twenty', {
    method: 'POST',
    headers: {
      'Content-Type': options.contentType ?? 'application/json',
      'X-Twenty-Webhook-Timestamp': timestamp,
      'X-Twenty-Webhook-Nonce': nonce,
      'X-Twenty-Webhook-Signature': await sign(timestamp, nonce, rawBody),
    },
    body: rawBody,
  });
};
const env = (send = vi.fn().mockResolvedValue(undefined)) => ({
  BRIDGE_HMAC_SECRET: SECRET,
  BRIDGE_SOURCE_WORKSPACE_KEY: WORKSPACE_KEY,
  BRIDGE_QUEUE: { send },
});
describe('authenticated bridge ingress', () => {
  it('enqueues normalized metadata and excludes record values', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const response = await handleIngress(await request(), env(send), NOW);
    expect(response.status).toBe(202);
    const expected = { ...envelope, sourceWorkspaceKey: WORKSPACE_KEY };
    delete (expected as Record<string, unknown>).record;
    delete (expected as Record<string, unknown>).workspaceId;
    expect(send).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith({ ...expected, timestamp: String(NOW) });
    expect(JSON.stringify(send.mock.calls)).not.toContain('must not reach');
  });
  it('rejects altered, stale, future, nonce-invalid, and unknown-workspace requests', async () => {
    const current = await request();
    const altered = new Request(current, {
      method: 'POST',
      body: JSON.stringify({ ...envelope, recordId: 'other' }),
    });
    const checks = [
      altered,
      await request(envelope, { timestamp: String(NOW - 301_000) }),
      await request(envelope, { timestamp: String(NOW + 301_000) }),
      await request(envelope, { nonce: 'bad' }),
      await request({ ...envelope, sourceWorkspaceKey: 'unknown' }),
    ];
    const responses = await Promise.all(
      checks.map((check) => handleIngress(check, env(), NOW)),
    );
    expect(responses.map(({ status }) => status)).toEqual([
      401, 401, 401, 401, 401,
    ]);
  });
  it('rejects content, schema, and event/object validation failures', async () => {
    const checks = [
      [envelope, { contentType: 'text/plain' }],
      [{ ...envelope, updatedFields: 'title' }, {}],
      [{ ...envelope, eventName: 'company.updated' }, {}],
      [{ ...envelope, schemaVersion: 2 }, {}],
    ] as const;
    const responses = await Promise.all(
      checks.map(([body, options]) =>
        request(body, options).then((signed) =>
          handleIngress(signed, env(), NOW),
        ),
      ),
    );
    expect(responses.map(({ status }) => status)).toEqual([400, 400, 400, 400]);
  });
  it('bounds body processing and exposes Queue failures as retryable', async () => {
    const send = vi.fn().mockRejectedValue(new Error('queue unavailable'));
    const oversized = await request({
      ...envelope,
      record: { value: 'x'.repeat(MAX_BODY_BYTES) },
    });
    expect((await handleIngress(oversized, env(), NOW)).status).toBe(413);
    expect((await handleIngress(await request(), env(send), NOW)).status).toBe(
      503,
    );
    expect(send).toHaveBeenCalledOnce();
  });
});
