/* oxlint-disable typescript/no-unsafe-type-assertion */
import { expect, it, vi } from 'vitest';
import {
  projectSourceEvent,
  validateCredentialRotation,
  validateDestinationAdapterConfig,
} from '../src/projection';
import { replayDeadLetter as replay } from '../src/delivery-state';
import { readSharedFile, MAX_SHARED_FILE_BYTES } from '../src/shared-files';
import type { NormalizedBridgeMessage } from '../src/ingress';

const file = JSON.parse(
  '{"fileId":"f","name":"f","mediaType":"text/plain","sizeBytes":1,"downloadUrl":"https://f"}',
);
const event = JSON.parse(
  '{"schemaVersion":1,"sourceWorkspaceKey":"source-team","deliveryId":"id","timestamp":"1","eventId":"id","eventName":"task.updated","objectId":"task","objectName":"task","recordId":"record","updatedFields":["title"],"sourceFields":{"title":"x"},"workspaceRole":"source"}',
) as NormalizedBridgeMessage;
const fetcher = async () =>
  new Response('x', { headers: { 'content-type': 'text/plain' } });

it('requires explicit file sharing and deduplicates the digest', async () => {
  expect(projectSourceEvent({ ...event, sharedFiles: [file] })).toMatchObject({
    status: 'blocked',
  });
  expect(
    projectSourceEvent({ ...event, shareRequested: true, sharedFiles: [file] }),
  ).toMatchObject({ sharedFiles: [file] });
  const [one, two] = await Promise.all([
    readSharedFile(file, fetcher),
    readSharedFile(file, fetcher),
  ]);
  expect(one.digest).toBe(two.digest);
});
it.each([
  ['video/mp4', 1],
  ['text/plain', MAX_SHARED_FILE_BYTES + 1],
])('rejects %s and oversized files', async (mediaType, sizeBytes) => {
  await expect(
    readSharedFile({ ...file, mediaType, sizeBytes }, fetcher),
  ).rejects.toThrow('descriptor_invalid');
  expect(
    validateDestinationAdapterConfig({
      apiUrl: 'https://d',
      apiKey: 'test-only',
      scopes: ['records:read', 'records:write', 'files:write'],
    }),
  ).toBeUndefined();
  expect(validateCredentialRotation('old', 'old')).toBe(
    'credential_rotation_invalid',
  );
});
it('replays a DLQ row idempotently', async () => {
  const id = `dlq-${crypto.randomUUID()}`;
  let state = 'pending';
  const database = {
    prepare: () => ({
      bind: () => ({
        first: async () => ({
          body_json: JSON.stringify({ ...event, deliveryId: id, eventId: id }),
          status: state,
        }),
        run: async () => {
          state = 'replayed';
        },
      }),
    }),
  } as unknown as D1Database;
  const send = vi.fn().mockResolvedValue(undefined);
  await expect(
    replay(database, { send }, id, 'bad', 'operator'),
  ).rejects.toThrow('unauthorized');
  expect(await replay(database, { send }, id, 'operator', 'operator')).toBe(
    'replayed',
  );
  expect(await replay(database, { send }, id, 'operator', 'operator')).toBe(
    'already_replayed',
  );
  expect(send).toHaveBeenCalledOnce();
});
