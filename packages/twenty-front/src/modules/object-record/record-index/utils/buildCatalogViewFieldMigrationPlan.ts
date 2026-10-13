import { type ViewField } from '@/views/types/ViewField';
import { v4 } from 'uuid';

const DEFAULT_VIEW_FIELD_SIZE = 100;

export type CatalogViewFieldMigrationPlan = {
  legacyRoleFieldMetadataIds: string[];
  viewFieldsToCreate: Omit<ViewField, 'definition'>[];
};

export const buildCatalogViewFieldMigrationPlan = ({
  availableFieldMetadataIds,
  createId = v4,
  legacyRoleFieldMetadataIds,
  viewFields,
}: {
  availableFieldMetadataIds: string[];
  createId?: () => string;
  legacyRoleFieldMetadataIds: (string | null | undefined)[];
  viewFields: Omit<ViewField, 'definition'>[];
}): CatalogViewFieldMigrationPlan => {
  const availableFieldMetadataIdSet = new Set(availableFieldMetadataIds);
  const migratedRoleFieldMetadataIds = [
    ...new Set(
      legacyRoleFieldMetadataIds.filter(
        (fieldMetadataId): fieldMetadataId is string =>
          typeof fieldMetadataId === 'string' &&
          availableFieldMetadataIdSet.has(fieldMetadataId),
      ),
    ),
  ];
  const existingViewFieldsByMetadataId = new Map<string, ViewField>();

  for (const viewField of viewFields) {
    if (!existingViewFieldsByMetadataId.has(viewField.fieldMetadataId)) {
      existingViewFieldsByMetadataId.set(viewField.fieldMetadataId, viewField);
    }
  }

  let nextPosition =
    viewFields.reduce(
      (maxPosition, viewField) => Math.max(maxPosition, viewField.position),
      -1,
    ) + 1;

  const viewFieldsToCreate: Omit<ViewField, 'definition'>[] = [];

  for (const fieldMetadataId of migratedRoleFieldMetadataIds) {
    const existingViewField =
      existingViewFieldsByMetadataId.get(fieldMetadataId);

    if (existingViewField) {
      continue;
    }

    viewFieldsToCreate.push({
      id: createId(),
      fieldMetadataId,
      position: nextPosition,
      isActive: true,
      isVisible: true,
      size: DEFAULT_VIEW_FIELD_SIZE,
    });
    nextPosition += 1;
  }

  return {
    legacyRoleFieldMetadataIds: migratedRoleFieldMetadataIds,
    viewFieldsToCreate,
  };
};
