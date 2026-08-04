import { exports } from 'cloudflare:workers';
import {
  createExecutionContext,
  createMessageBatch,
  getQueueResult,
} from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

import worker from '../src/index';
// @ts-expect-error Vite provides raw imports during test bundling.
import wranglerConfig from '../wrangler.jsonc?raw';

describe('cross-workspace bridge', () => {
  it('returns public service health', async () => {
    const response = await exports.default.fetch('https://bridge.test/health');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: 'ok',
      service: 'odelza-cross-workspace-bridge',
    });
  });

  it('returns 404 for other routes', async () => {
    const response = await exports.default.fetch('https://bridge.test/missing');

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'not_found' });
  });

  it('keeps every environment producer-only until Slice 4 owns consumption', () => {
    expect(wranglerConfig.match(/"producers"/g)).toHaveLength(3);
    expect(wranglerConfig).not.toContain('"consumers"');
  });

  it('acknowledges noop queue messages', async () => {
    const batch = createMessageBatch('bridge-test', [
      {
        id: 'noop',
        timestamp: new Date(0),
        body: { type: 'noop' },
        attempts: 1,
      },
    ]);
    const context = createExecutionContext();

    worker.queue(batch);

    await expect(getQueueResult(batch, context)).resolves.toMatchObject({
      explicitAcks: ['noop'],
      retryMessages: [],
    });
  });

  it.each([
    ['malformed', { payload: 'missing-type' }],
    ['unexpected', { type: 'sync' }],
  ])('retries %s queue messages', async (id, body) => {
    const batch = createMessageBatch('bridge-test', [
      { id, timestamp: new Date(0), body, attempts: 1 },
    ]);
    const context = createExecutionContext();

    worker.queue(batch);

    await expect(getQueueResult(batch, context)).resolves.toMatchObject({
      explicitAcks: [],
      retryMessages: [{ msgId: id }],
    });
  });
});
