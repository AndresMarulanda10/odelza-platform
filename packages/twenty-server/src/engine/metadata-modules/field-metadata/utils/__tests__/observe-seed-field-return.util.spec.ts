import { observeSeedFieldReturn } from 'src/engine/metadata-modules/field-metadata/utils/observe-seed-field-return.util';

describe('observeSeedFieldReturn', () => {
  const source = {
    id: 'private-source-id',
    universalIdentifier: 'private-source-universal-id',
    objectMetadataId: 'private-source-object-id',
    inPlannedCreate: true,
  };
  const inverse = {
    id: 'private-inverse-id',
    universalIdentifier: 'private-inverse-universal-id',
    objectMetadataId: 'private-inverse-object-id',
    inPlannedCreate: false,
  };
  const error = new Error('private error details');
  const lookup = () => {
    throw error;
  };

  it('does not read or emit on successful lookup', async () => {
    const readPersisted = jest.fn();
    const emit = jest.fn();
    const planned = jest.fn(() => [source, inverse]);

    await expect(
      observeSeedFieldReturn({
        lookup: () => source,
        planned,
        returned: {},
        readPersisted,
        emit,
      }),
    ).resolves.toBe(source);
    expect(readPersisted).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(planned).not.toHaveBeenCalled();
  });

  it.each([
    {
      title: 'persisted but missing cache',
      rows: [source, inverse],
      cache: {},
    },
    { title: 'not persisted', rows: [], cache: {} },
    {
      title: 'wrong persisted object and mismatched cached identity',
      rows: [{ ...source, objectMetadataId: 'private-wrong-object' }, inverse],
      cache: {
        [source.universalIdentifier]: { ...source, id: 'private-wrong-id' },
      },
    },
  ])('$title', async ({ rows, cache }) => {
    const emit = jest.fn();
    const readPersisted = jest.fn().mockResolvedValue(rows);

    await expect(
      observeSeedFieldReturn({
        lookup,
        planned: () => [source, inverse],
        returned: cache,
        readPersisted,
        emit,
      }),
    ).rejects.toBe(error);
    expect(readPersisted).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledTimes(1);
    const observation = emit.mock.calls[0][0];

    expect(observation.generatedMemberCount).toBe(2);
    expect(observation.plannedCreateCount).toBe(1);
    expect(observation.members[0]).toEqual({
      alias: 'source',
      inPlannedCreate: true,
      persistedCount: rows.length === 0 ? 0 : 1,
      persistedObjectMatchesPlan:
        rows[0]?.objectMetadataId === source.objectMetadataId,
      returnedMapPresent: Object.keys(cache).length > 0,
      returnedObjectMatchesPlan: Object.keys(cache).length > 0,
      persistedIdMatchesReturned: false,
    });
    expect(observation.members[1].alias).toBe('inverse');
    expect(JSON.stringify(observation)).not.toContain('private');
    expect(observation.members[1].inPlannedCreate).toBe(false);
  });

  it('reports matching persistence and returned-map identity without exposing identifiers', async () => {
    const emit = jest.fn();

    await expect(
      observeSeedFieldReturn({
        lookup,
        planned: () => [source, inverse],
        returned: { [inverse.universalIdentifier]: inverse },
        readPersisted: async () => [source, inverse],
        emit,
      }),
    ).rejects.toBe(error);
    expect(emit.mock.calls[0][0].members[1]).toMatchObject({
      returnedMapPresent: true,
      persistedIdMatchesReturned: true,
      persistedObjectMatchesPlan: true,
    });
    expect(JSON.stringify(emit.mock.calls)).not.toContain('private');
  });

  it.each(['projection', 'read', 'emit'])(
    'preserves the original error when %s fails',
    async (failure) => {
      const emit = jest.fn(() => {
        if (failure === 'emit') {
          throw new Error('private logging details');
        }
      });

      await expect(
        observeSeedFieldReturn({
          lookup,
          planned: () => {
            if (failure === 'projection') {
              throw new Error('private metadata projection details');
            }

            return [source, inverse];
          },
          returned: {},
          readPersisted: async () => {
            if (failure === 'read') {
              throw new Error('private SQL and parameters');
            }

            return [];
          },
          emit,
        }),
      ).rejects.toBe(error);
      expect(JSON.stringify(emit.mock.calls)).not.toContain('private');
      expect(emit).toHaveBeenCalledTimes(1);
      if (failure !== 'emit') {
        expect(emit).toHaveBeenCalledWith({
          event: 'seed-junction-return-missing',
          persistenceRead: 'unavailable',
        });
      }
    },
  );
});
