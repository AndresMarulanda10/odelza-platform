export const TASK_TIMELINE_FIELD_MAPPINGS = [
  ['titleFieldMetadataId', 'titleFieldMetadataUniversalIdentifier'],
  ['startDateFieldMetadataId', 'startDateFieldMetadataUniversalIdentifier'],
  ['dueDateFieldMetadataId', 'dueDateFieldMetadataUniversalIdentifier'],
  ['progressFieldMetadataId', 'progressFieldMetadataUniversalIdentifier'],
  ['statusFieldMetadataId', 'statusFieldMetadataUniversalIdentifier'],
  ['milestoneFieldMetadataId', 'milestoneFieldMetadataUniversalIdentifier'],
  ['dependencyFieldMetadataId', 'dependencyFieldMetadataUniversalIdentifier'],
  [
    'dependencyTypeFieldMetadataId',
    'dependencyTypeFieldMetadataUniversalIdentifier',
  ],
] as const;

export type TaskTimelineFieldMappingUniversal = {
  [P in (typeof TASK_TIMELINE_FIELD_MAPPINGS)[number][1]]?: string | null;
};
