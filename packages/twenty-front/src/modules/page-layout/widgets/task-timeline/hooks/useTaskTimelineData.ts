import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type TaskDependency,
  type TaskTimelineItem,
  type WidgetDataState,
} from 'twenty-shared/types';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const getDate = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

const getProgress = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
    ? value
    : null;

const isTaskDependency = (value: unknown): value is TaskDependency => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const dependency = value as Partial<TaskDependency>;
  return (
    typeof dependency.predecessorId === 'string' &&
    typeof dependency.successorId === 'string' &&
    dependency.type === 'FINISH_TO_START' &&
    typeof dependency.conflict === 'boolean'
  );
};

const toTimelineItem = (record: ObjectRecord): TaskTimelineItem => ({
  id: record.id,
  title: typeof record.title === 'string' ? record.title : '',
  startDate: getDate(record.startDate),
  endDate: getDate(record.endDate),
  progress: getProgress(record.progress),
  isMilestone: record.isMilestone === true,
  dependencies: Array.isArray(record.dependencies)
    ? record.dependencies.filter(isTaskDependency)
    : [],
  conflict: record.conflict === true,
});

export const useTaskTimelineData = (widget: PageLayoutWidget) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Task,
  });
  const { recordGqlFields } = useGenerateDepthRecordGqlFieldsFromObject({
    objectNameSingular: CoreObjectNameSingular.Task,
    depth: 0,
  });
  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );
  const hasDateFields = ['startDate', 'endDate'].every((fieldName) =>
    objectMetadataItem.fields.some((field) => field.name === fieldName),
  );
  const hasConfiguredSource = widget.objectMetadataId === objectMetadataItem.id;
  const hasReadPermission = objectPermissions.canReadObjectRecords !== false;
  const recordsQuery = useFindManyRecords<ObjectRecord>({
    objectNameSingular: CoreObjectNameSingular.Task,
    recordGqlFields,
    skip: !hasConfiguredSource || !hasDateFields || !hasReadPermission,
    fetchPolicy: 'cache-and-network',
  });

  if (!hasReadPermission) {
    return {
      status: 'forbidden' as WidgetDataState,
      items: [],
      hasConfigurationGap: false,
      retry: () => undefined,
    };
  }

  if (!hasConfiguredSource || !hasDateFields) {
    return {
      status: 'partial' as WidgetDataState,
      items: [],
      hasConfigurationGap: true,
      retry: () => undefined,
    };
  }

  const items = recordsQuery.records.map(toTimelineItem);

  if (recordsQuery.loading && items.length === 0) {
    return {
      status: 'loading' as WidgetDataState,
      items,
      hasConfigurationGap: false,
      retry: () => undefined,
    };
  }

  if (recordsQuery.error && items.length === 0) {
    return {
      status: 'error' as WidgetDataState,
      items,
      error: recordsQuery.error,
      hasConfigurationGap: false,
      retry: () => void recordsQuery.refetch(),
    };
  }

  if (items.length === 0) {
    return {
      status: 'empty' as WidgetDataState,
      items,
      hasConfigurationGap: false,
      retry: () => void recordsQuery.refetch(),
    };
  }

  return {
    status:
      recordsQuery.error || items.some((item) => !item.startDate || !item.endDate)
        ? ('partial' as WidgetDataState)
        : ('ready' as WidgetDataState),
    items,
    error: recordsQuery.error,
    hasConfigurationGap: false,
    retry: () => void recordsQuery.refetch(),
  };
};
