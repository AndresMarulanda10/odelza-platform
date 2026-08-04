import { env } from 'cloudflare:workers';
import { applyD1Migrations } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';
import { processDeliveryMessage } from '../src/delivery-state';
import type { NormalizedBridgeMessage } from '../src/ingress';
import type { DestinationAdapter, SourceProjection } from '../src/projection';
// @ts-expect-error Vite provides raw imports during test bundling.
import deliverySql from '../migrations/0001_durable_delivery_state.sql?raw';
// @ts-expect-error Vite provides raw imports during test bundling.
import projectionSql from '../migrations/0002_source_projection.sql?raw';

const migrations = [deliverySql, projectionSql].map((sql, index) => ({
  name: `bridge-${index}.sql`,
  queries: sql
    .split(';')
    .map((query: string) => query.trim())
    .filter(Boolean),
}));
const event = (
  objectName: string,
  eventType: string,
  sourceFields: Record<string, unknown>,
  updatedFields = Object.keys(sourceFields),
): NormalizedBridgeMessage => {
  const id = crypto.randomUUID();
  return {
    schemaVersion: 1,
    sourceWorkspaceKey: 'source-team',
    deliveryId: id,
    timestamp: '1754053200000',
    eventId: id,
    eventName: `${objectName}.${eventType}`,
    objectId: `${objectName}-object`,
    objectName,
    recordId: `${objectName}-record-${id}`,
    updatedFields,
    sourceFields,
  };
};
type FakeAdapter = DestinationAdapter & { published: SourceProjection[] };
const fakeAdapter = (): FakeAdapter => {
  const adapter: FakeAdapter = {
    destinationKey: 'fake-destination',
    published: [],
    publish: async (projection) => {
      adapter.published.push(projection);
      return { destinationRecordId: `destination-${adapter.published.length}` };
    },
  };
  return adapter;
};
const run = (body: NormalizedBridgeMessage, adapter: DestinationAdapter) =>
  processDeliveryMessage(
    { body, ack: () => undefined, retry: () => undefined },
    env.BRIDGE_DB,
    adapter,
  );
const state = (deliveryId: string) =>
  env.BRIDGE_DB.prepare(
    'SELECT projection_status, blocked_reason FROM bridge_pending_events WHERE delivery_id = ?',
  )
    .bind(deliveryId)
    .first();

describe('source projection', () => {
  beforeEach(async () => applyD1Migrations(env.BRIDGE_DB, migrations));
  it.each([
    ['company', 'Source Company'],
    ['project', 'Source Project'],
  ])('projects %s context from the source only', async (objectName, name) => {
    const adapter = fakeAdapter();
    await run(event(objectName, 'updated', { name }), adapter);
    expect(adapter.published[0]).toMatchObject({
      objectName,
      fields: { name },
      authority: 'source',
    });
  });
  it('publishes only the approved Task fields', async () => {
    const adapter = fakeAdapter();
    const fields = {
      title: 'Source task',
      status: 'TODO',
      dueAt: '2026-08-05T00:00:00.000Z',
      progress: 25,
    };
    await run(event('task', 'updated', fields), adapter);
    expect(adapter.published[0].fields).toEqual(fields);
  });
  it('blocks unsupported fields instead of dropping them', async () => {
    const adapter = fakeAdapter();
    const body = event('task', 'updated', {
      title: 'Source task',
      description: 'not allowed',
    });
    await run(body, adapter);
    expect(adapter.published).toHaveLength(0);
    await expect(state(body.deliveryId)).resolves.toMatchObject({
      projection_status: 'blocked',
      blocked_reason: 'unsupported_field:description',
    });
  });
  it('blocks unsupported objects', async () => {
    const adapter = fakeAdapter();
    const body = event('contact', 'updated', { name: 'Unknown' });
    await run(body, adapter);
    expect(adapter.published).toHaveLength(0);
    await expect(state(body.deliveryId)).resolves.toMatchObject({
      projection_status: 'blocked',
      blocked_reason: 'unsupported_object',
    });
  });
  it('does not republish a duplicate projection', async () => {
    const adapter = fakeAdapter();
    const body = event('task', 'updated', { title: 'Once' });
    await run(body, adapter);
    await run(body, adapter);
    expect(adapter.published).toHaveLength(1);
  });
  it('blocks deletes and retains their projection record', async () => {
    const adapter = fakeAdapter();
    const body = event('project', 'deleted', { name: 'Retained' }, []);
    await run(body, adapter);
    expect(adapter.published).toHaveLength(0);
    await expect(state(body.deliveryId)).resolves.toMatchObject({
      projection_status: 'blocked',
      blocked_reason: 'delete_not_propagated',
    });
  });
});
