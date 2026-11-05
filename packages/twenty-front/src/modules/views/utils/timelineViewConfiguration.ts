import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { DEFAULT_TASK_TIMELINE_BAR_COLOR } from 'twenty-shared/constants';
import {
  type TaskTimelineFieldMapping,
  type ViewTimelineConfiguration,
} from 'twenty-shared/types';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';

type TimelineField = Pick<
  FieldMetadataItem,
  'id' | 'universalIdentifier' | 'name' | 'type' | 'isActive'
>;

export const getDefaultTimelineViewConfiguration = (
  fields: readonly TimelineField[],
): ViewTimelineConfiguration => {
  const dates = fields.filter(
    (field) => field.isActive && isFieldMetadataDateKind(field.type),
  );
  return {
    startDateFieldMetadataUniversalIdentifier:
      dates.find((field) => field.name === 'startDate')?.universalIdentifier ??
      null,
    endDateFieldMetadataUniversalIdentifier:
      dates.find((field) => field.name === 'endDate')?.universalIdentifier ??
      dates.find((field) => field.name === 'dueAt')?.universalIdentifier ??
      null,
    barColor: DEFAULT_TASK_TIMELINE_BAR_COLOR,
  };
};

export const resolveTimelineViewFieldMapping = (
  configuration: ViewTimelineConfiguration | null | undefined,
  fields: readonly Pick<TimelineField, 'id' | 'universalIdentifier'>[],
): TaskTimelineFieldMapping => ({
  startDateFieldMetadataId:
    fields.find(
      (field) =>
        field.universalIdentifier ===
        configuration?.startDateFieldMetadataUniversalIdentifier,
    )?.id ?? null,
  dueDateFieldMetadataId:
    fields.find(
      (field) =>
        field.universalIdentifier ===
        configuration?.endDateFieldMetadataUniversalIdentifier,
    )?.id ?? null,
});
