type MetadataIdentity = {
  universalIdentifier: string;
  objectMetadataId?: string;
};

type StoredMetadataIdentity = MetadataIdentity & { id: string };

// Called only by the opted-in CI dev-seed junction hook. Never repairs the map.
export const observeSeedFieldReturn = async <T>({
  lookup,
  planned,
  returned,
  readPersisted,
  emit,
}: {
  lookup: () => T;
  planned: () => (MetadataIdentity & { inPlannedCreate: boolean })[];
  returned: Record<string, StoredMetadataIdentity | undefined>;
  readPersisted: () => Promise<StoredMetadataIdentity[]>;
  emit: (observation: object) => void;
}): Promise<T> => {
  try {
    return lookup();
  } catch (error) {
    let observation: object;

    try {
      const plannedFields = planned();
      const persisted = await readPersisted();

      observation = {
        event: 'seed-junction-return-missing',
        persistenceRead: 'ok',
        generatedMemberCount: plannedFields.length,
        plannedCreateCount: plannedFields.filter(
          (field) => field.inPlannedCreate,
        ).length,
        members: plannedFields.map((field, index) => {
          const matches = persisted.filter(
            (row) => row.universalIdentifier === field.universalIdentifier,
          );
          const cached = returned[field.universalIdentifier];

          return {
            alias: index === 0 ? 'source' : 'inverse',
            inPlannedCreate: field.inPlannedCreate,
            persistedCount: matches.length,
            persistedObjectMatchesPlan: matches.some(
              (row) =>
                field.objectMetadataId !== undefined &&
                row.objectMetadataId === field.objectMetadataId,
            ),
            returnedMapPresent: cached !== undefined,
            returnedObjectMatchesPlan:
              cached !== undefined &&
              field.objectMetadataId !== undefined &&
              cached.objectMetadataId === field.objectMetadataId,
            persistedIdMatchesReturned:
              cached !== undefined &&
              matches.some((row) => row.id === cached.id),
          };
        }),
      };
    } catch {
      observation = {
        event: 'seed-junction-return-missing',
        persistenceRead: 'unavailable',
      };
    }

    try {
      emit(observation);
    } catch {
      // Do not serialize diagnostic exceptions or replace the original failure.
    }

    throw error;
  }
};
