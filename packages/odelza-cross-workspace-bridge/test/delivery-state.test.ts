import { env } from 'cloudflare:workers';
import {
  applyD1Migrations,
  createExecutionContext,
  createMessageBatch,
  getQueueResult,
} from 'cloudflare:test';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import worker from '../src/index';
import { processDeliveryMessage } from '../src/delivery-state';
import type { NormalizedBridgeMessage } from '../src/ingress';
// @ts-expect-error Vite provides raw imports during test bundling.
import migrationSql from '../migrations/0001_durable_delivery_state.sql?raw';

/* oxlint-disable typescript/no-unsafe-type-assertion */
const migrations = [
  {
    name: '0001_durable_delivery_state.sql',
    queries: migrationSql
      .split(';')
      .map((query: string) => query.trim())
      .filter(Boolean),
  },
];
const message = (deliveryId: string): NormalizedBridgeMessage => ({
  schemaVersion: 1,
  sourceWorkspaceKey: 'source-team',
  deliveryId,
  timestamp: '1754053200000',
  eventId: deliveryId,
  eventName: 'task.updated',
  objectId: 'task-object-1',
  objectName: 'task',
  recordId: 'record-1',
  updatedFields: ['title'],
});
const createBatch = (id: string, body = message(id), attempts = 1) =>
  createMessageBatch('bridge-test', [
    { id, timestamp: new Date(), body, attempts },
  ]);
type BatchRunner = (
  statements: unknown[],
) => Promise<Array<{ meta: { changes: number } }>>;
const fakeDatabase = (batch: BatchRunner): D1Database =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  ({
    prepare: vi.fn(() => ({ bind: vi.fn(() => ({})) })),
    batch,
  }) as unknown as D1Database;
describe('durable bridge delivery state', () => {
  beforeEach(async () => {
    await applyD1Migrations(env.BRIDGE_DB, migrations);
  });
  it('persists before acknowledging the first delivery', async () => {
    const deliveryId = `first-${crypto.randomUUID()}`;
    const batch = createBatch(deliveryId);
    await worker.queue(batch, env);
    await expect(
      getQueueResult(batch, createExecutionContext()),
    ).resolves.toMatchObject({
      explicitAcks: [deliveryId],
      retryMessages: [],
    });
    await expect(
      env.BRIDGE_DB.prepare(
        'SELECT delivery_id, projection_status FROM bridge_pending_events WHERE delivery_id = ?',
      )
        .bind(deliveryId)
        .first(),
    ).resolves.toMatchObject({
      delivery_id: deliveryId,
      projection_status: 'pending',
    });
  });
  it('acknowledges a duplicate without adding another receipt or pending event', async () => {
    const deliveryId = `duplicate-${crypto.randomUUID()}`;
    const body = message(deliveryId);
    const first = createBatch(`${deliveryId}-first`, body);
    const duplicate = createBatch(`${deliveryId}-duplicate`, body, 2);
    await worker.queue(first, env);
    await worker.queue(duplicate, env);
    await expect(
      getQueueResult(duplicate, createExecutionContext()),
    ).resolves.toMatchObject({
      explicitAcks: [`${deliveryId}-duplicate`],
      retryMessages: [],
    });
    await expect(
      env.BRIDGE_DB.prepare(
        'SELECT COUNT(*) AS count FROM bridge_delivery_receipts WHERE delivery_id = ?',
      )
        .bind(deliveryId)
        .first(),
    ).resolves.toMatchObject({ count: 1 });
  });
  it('acknowledges only after storage succeeds', async () => {
    let persisted = false;
    const database = fakeDatabase(
      vi.fn(async () => {
        persisted = true;
        return [{ meta: { changes: 1 } }];
      }),
    );
    const ack = vi.fn(() => expect(persisted).toBe(true));
    await processDeliveryMessage(
      { body: message('ordering'), ack, retry: vi.fn() },
      database,
    );

    expect(ack).toHaveBeenCalledOnce();
  });
  it('retries transient storage failures and does not acknowledge malformed messages', async () => {
    const retry = vi.fn();
    const database = fakeDatabase(
      vi.fn().mockRejectedValue(new Error('temporary D1 failure')),
    );
    await processDeliveryMessage(
      { body: message('storage-error'), ack: vi.fn(), retry },
      database,
    );
    expect(retry).toHaveBeenCalledOnce();
    const ack = vi.fn();
    await expect(
      processDeliveryMessage(
        { body: { type: 'unsupported' }, ack, retry: vi.fn() },
        database,
      ),
    ).rejects.toThrow('bridge queue message is malformed or unsupported');
    expect(ack).not.toHaveBeenCalled();
  });
});
