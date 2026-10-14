import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { filterReadableActiveObjectMetadataItems } from '@/object-metadata/utils/filterReadableActiveObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  CoreObjectNameSingular,
  FieldMetadataType,
  type ObjectPermissions,
  type TaskTimelineFieldMapping,
} from 'twenty-shared/types';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';

export const getTimelineSources = (
  objects: EnrichedObjectMetadataItem[],
  permissions: Record<string, ObjectPermissions & { objectMetadataId: string }>,
) => filterReadableActiveObjectMetadataItems(objects, permissions);

export const isTimelineLabelField = (field: Pick<FieldMetadataItem, 'type'>) =>
  field.type === FieldMetadataType.TEXT ||
  field.type === FieldMetadataType.FULL_NAME;

export const getTimelineFields = (
  source: EnrichedObjectMetadataItem,
  permissions: ObjectPermissions,
  kind: 'date' | 'title',
) =>
  source.readableFields.filter(
    (field) =>
      field.isActive === true &&
      permissions.restrictedFields?.[field.id]?.canRead !== false &&
      (kind === 'date'
        ? isFieldMetadataDateKind(field.type)
        : isTimelineLabelField(field)),
  );

// Source changes intentionally reset every role, including roles not exposed in
// this editor. None of the previous object's identifiers may cross the boundary.
export const emptyTimelineMapping = (): TaskTimelineFieldMapping => ({
  titleFieldMetadataId: null,
  startDateFieldMetadataId: null,
  dueDateFieldMetadataId: null,
  progressFieldMetadataId: null,
  statusFieldMetadataId: null,
  milestoneFieldMetadataId: null,
  dependencyFieldMetadataId: null,
  dependencyTypeFieldMetadataId: null,
});

export const isLegacyTaskSource = (source: EnrichedObjectMetadataItem) =>
  source.nameSingular === CoreObjectNameSingular.Task;
