import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { normalizeTaskTimelineDate } from '@/page-layout/widgets/task-timeline/utils/getTaskTimelineCalendar';
import {
  CoreObjectNameSingular,
  FieldMetadataType,
  RelationType,
  type TaskDependency,
  type TaskTimelineFieldMapping,
  type TaskTimelineItem,
  type WidgetDataState,
} from 'twenty-shared/types';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

export type TaskTimelineEditInput = {
  taskId: string;
  startDate?: string | null;
  endDate?: string | null;
  progress?: number | null;
};

export type TaskTimelineData = {
  status: WidgetDataState;
  items: TaskTimelineItem[];
  hasConfigurationGap: boolean;
  configurationReason?: 'invalid-date-mapping' | 'missing-date-mapping';
  retry: () => void;
  error?: Error;
  canEditDates?: boolean;
  canEditProgress?: boolean;
  updateTask?: (input: TaskTimelineEditInput) => Promise<void>;
};

const getDate = (value: unknown): string | null =>
  normalizeTaskTimelineDate(value);

const getProgress = (value: unknown): number | null =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 100
    ? value
    : null;

const getProgressFromStatus = (status: unknown): number | null => {
  if (typeof status !== 'string') {
    return null;
  }

  return status === 'DONE' ? 100 : 0;
};

const getTimelineProgress = (
  progress: unknown,
  status: unknown,
): number | null => {
  if (progress === null || progress === undefined) {
    return getProgressFromStatus(status);
  }

  return getProgress(progress);
};

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

const getConfiguredFieldName = ({
  fields,
  configuredFieldMetadataId,
  fallbackNames,
  requiredDate = false,
}: {
  fields: Array<{
    id: string;
    name: string;
    isActive?: boolean | null;
    type?: FieldMetadataType;
  }>;
  configuredFieldMetadataId: string | null | undefined;
  fallbackNames: string[];
  requiredDate?: boolean;
}): string | undefined => {
  const candidates = requiredDate
    ? fields.filter(
        (field) =>
          field.isActive === true && isFieldMetadataDateKind(field.type),
      )
    : fields;
  if (configuredFieldMetadataId != null) {
    const configuredFieldName = candidates.find(
      ({ id }) => id === configuredFieldMetadataId,
    )?.name;

    if (configuredFieldName !== undefined || requiredDate) {
      return configuredFieldName;
    }
  }

  return candidates.find(({ name }) => fallbackNames.includes(name))?.name;
};

export const resolveTaskTimelineFieldNames = ({
  fields,
  fieldMapping,
}: {
  fields: Array<{
    id: string;
    name: string;
    isActive?: boolean | null;
    type?: FieldMetadataType;
  }>;
  fieldMapping: TaskTimelineFieldMapping | null | undefined;
}) => ({
  title: getConfiguredFieldName({
    fields,
    configuredFieldMetadataId: fieldMapping?.titleFieldMetadataId,
    fallbackNames: ['title'],
  }),
  startDate: getConfiguredFieldName({
    fields,
    configuredFieldMetadataId: fieldMapping?.startDateFieldMetadataId,
    fallbackNames: ['startDate'],
    requiredDate: true,
  }),
  endDate: getConfiguredFieldName({
    fields,
    configuredFieldMetadataId: fieldMapping?.dueDateFieldMetadataId,
    fallbackNames: ['endDate', 'dueAt'],
    requiredDate: true,
  }),
  progress: getConfiguredFieldName({
    fields,
    configuredFieldMetadataId: fieldMapping?.progressFieldMetadataId,
    fallbackNames: ['progress'],
  }),
  status: getConfiguredFieldName({
    fields,
    configuredFieldMetadataId: fieldMapping?.statusFieldMetadataId,
    fallbackNames: ['status'],
  }),
  milestone: getConfiguredFieldName({
    fields,
    configuredFieldMetadataId: fieldMapping?.milestoneFieldMetadataId,
    fallbackNames: ['isMilestone'],
  }),
  dependency: getConfiguredFieldName({
    fields,
    configuredFieldMetadataId: fieldMapping?.dependencyFieldMetadataId,
    fallbackNames: ['dependencies'],
  }),
  dependencyType: getConfiguredFieldName({
    fields,
    configuredFieldMetadataId: fieldMapping?.dependencyTypeFieldMetadataId,
    fallbackNames: ['dependencyType'],
  }),
});

const getDependencyIds = (value: unknown): string[] => {
  if (typeof value === 'object' && value !== null && 'edges' in value) {
    const edges = (value as { edges?: unknown }).edges;
    return Array.isArray(edges)
      ? edges.flatMap((edge) => getDependencyIds(edge?.node))
      : [];
  }
  const values = Array.isArray(value) ? value : [value];

  return values.flatMap((dependency) => {
    if (typeof dependency === 'string') {
      return [dependency];
    }

    if (typeof dependency !== 'object' || dependency === null) {
      return [];
    }

    const dependencyRecord = dependency as {
      id?: unknown;
      predecessorId?: unknown;
    };
    const id = dependencyRecord.predecessorId ?? dependencyRecord.id;

    return typeof id === 'string' ? [id] : [];
  });
};

const getDependencies = ({
  record,
  dependencyFieldName,
  dependencyTypeFieldName,
}: {
  record: ObjectRecord;
  dependencyFieldName: string | undefined;
  dependencyTypeFieldName: string | undefined;
}): TaskDependency[] => {
  if (dependencyFieldName === undefined) {
    return Array.isArray(record.dependencies)
      ? record.dependencies.filter(isTaskDependency)
      : [];
  }

  const dependencyType =
    dependencyTypeFieldName === undefined
      ? 'FINISH_TO_START'
      : record[dependencyTypeFieldName];

  if (
    dependencyType !== undefined &&
    dependencyType !== null &&
    dependencyType !== 'FINISH_TO_START'
  ) {
    return [];
  }

  return getDependencyIds(record[dependencyFieldName]).map((predecessorId) => ({
    predecessorId,
    successorId: record.id,
    type: 'FINISH_TO_START',
    conflict: false,
  }));
};

const toTimelineItem = ({
  record,
  fields,
}: {
  record: ObjectRecord;
  fields: {
    title?: string;
    startDate?: string;
    endDate?: string;
    progress?: string;
    status?: string;
    milestone?: string;
    dependency?: string;
    dependencyType?: string;
  };
}): TaskTimelineItem => ({
  id: record.id,
  title:
    fields.title === undefined || typeof record[fields.title] !== 'string'
      ? ''
      : record[fields.title],
  startDate:
    fields.startDate === undefined ? null : getDate(record[fields.startDate]),
  endDate:
    fields.endDate === undefined ? null : getDate(record[fields.endDate]),
  progress: getTimelineProgress(
    fields.progress === undefined ? undefined : record[fields.progress],
    fields.status === undefined ? undefined : record[fields.status],
  ),
  isMilestone:
    fields.milestone === undefined ? false : record[fields.milestone] === true,
  dependencies: getDependencies({
    record,
    dependencyFieldName: fields.dependency,
    dependencyTypeFieldName: fields.dependencyType,
  }),
  conflict: record.conflict === true,
});

const getTaskTimelineFieldMapping = (
  widget: PageLayoutWidget,
): TaskTimelineFieldMapping | null | undefined => {
  if (widget.configuration?.__typename !== 'TaskTimelineConfiguration') {
    return undefined;
  }

  return widget.configuration.fieldMapping;
};

export const useTaskTimelineData = (
  widget: PageLayoutWidget,
): TaskTimelineData => {
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
  const fieldMapping = getTaskTimelineFieldMapping(widget);
  const timelineFields = resolveTaskTimelineFieldNames({
    fields: objectMetadataItem.fields,
    fieldMapping,
  });
  const startDateFieldName = timelineFields.startDate;
  const endDateFieldName = timelineFields.endDate;
  const titleFieldName = timelineFields.title;
  const progressFieldName = timelineFields.progress;
  const statusFieldName = timelineFields.status;
  const milestoneFieldName = timelineFields.milestone;
  const dependencyFieldName = timelineFields.dependency;
  const dependencyTypeFieldName = timelineFields.dependencyType;
  const dependencyField = objectMetadataItem.readableFields.find(
    (field) => field.name === dependencyFieldName && field.isActive,
  );
  const dependencyValueFieldName =
    dependencyField?.type === FieldMetadataType.RELATION &&
    dependencyField.relation?.type === RelationType.MANY_TO_ONE
      ? `${dependencyField.name}Id`
      : dependencyFieldName;
  const timelineRecordGqlFields = {
    ...recordGqlFields,
    ...(dependencyField?.type === FieldMetadataType.RELATION &&
    dependencyField.relation?.type === RelationType.ONE_TO_MANY
      ? { [dependencyField.name]: { id: true } }
      : {}),
  };
  const startDateField = objectMetadataItem.fields.find(
    (field) => field.name === startDateFieldName,
  );
  const endDateField = objectMetadataItem.fields.find(
    (field) => field.name === endDateFieldName,
  );
  const progressField = objectMetadataItem.fields.find(
    (field) => field.name === progressFieldName,
  );
  const hasDateFields =
    startDateField !== undefined && endDateField !== undefined;
  const hasConfiguredSource = widget.objectMetadataId === objectMetadataItem.id;
  const hasReadPermission =
    objectPermissions.canReadObjectRecords !== false &&
    [startDateField, endDateField].every(
      (field) =>
        field === undefined ||
        (objectPermissions.restrictedFields?.[field.id]?.canRead !== false &&
          objectMetadataItem.readableFields.some(
            (readable) => readable.id === field.id,
          )),
    );
  const hasUpdatePermission =
    objectPermissions.canUpdateObjectRecords !== false;
  const canEditDates =
    hasConfiguredSource &&
    hasReadPermission &&
    startDateField !== undefined &&
    endDateField !== undefined &&
    hasUpdatePermission &&
    !isFieldMetadataReadOnlyByPermissions({
      objectPermissions,
      fieldMetadataId: startDateField.id,
    }) &&
    !isFieldMetadataReadOnlyByPermissions({
      objectPermissions,
      fieldMetadataId: endDateField.id,
    });
  const canEditProgress =
    hasConfiguredSource &&
    hasDateFields &&
    hasReadPermission &&
    progressField !== undefined &&
    hasUpdatePermission &&
    !isFieldMetadataReadOnlyByPermissions({
      objectPermissions,
      fieldMetadataId: progressField.id,
    });
  const { updateOneRecord } = useUpdateOneRecord();
  const recordsQuery = useFindManyRecords<ObjectRecord>({
    objectNameSingular: CoreObjectNameSingular.Task,
    recordGqlFields: timelineRecordGqlFields,
    skip: !hasConfiguredSource || !hasDateFields || !hasReadPermission,
    fetchPolicy: 'cache-and-network',
  });

  const updateTask = async ({
    taskId,
    startDate,
    endDate,
    progress,
  }: TaskTimelineEditInput): Promise<void> => {
    const currentItem = recordsQuery.records
      .map((record) =>
        toTimelineItem({
          record,
          fields: {
            title: titleFieldName,
            startDate: startDateFieldName,
            endDate: endDateFieldName,
            progress: progressFieldName,
            status: statusFieldName,
            milestone: milestoneFieldName,
            dependency: dependencyValueFieldName,
            dependencyType: dependencyTypeFieldName,
          },
        }),
      )
      .find((item) => item.id === taskId);
    const nextStartDate =
      startDate === undefined ? currentItem?.startDate : startDate;
    const nextEndDate = endDate === undefined ? currentItem?.endDate : endDate;

    if (
      nextStartDate !== null &&
      nextStartDate !== undefined &&
      nextEndDate !== null &&
      nextEndDate !== undefined &&
      nextStartDate > nextEndDate
    ) {
      throw new Error('A task start date cannot be after its due date');
    }

    const updateInput: Record<string, unknown> = {};

    if (startDate !== undefined && canEditDates && isDefined(startDateField)) {
      updateInput[startDateField.name] = startDate;
    }

    if (endDate !== undefined && canEditDates && isDefined(endDateField)) {
      updateInput[endDateField.name] = endDate;
    }

    if (progress !== undefined && canEditProgress && isDefined(progressField)) {
      updateInput[progressField.name] = progress;
    }

    if (Object.keys(updateInput).length === 0) {
      throw new Error('Task timeline editing is unavailable');
    }

    await updateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Task,
      idToUpdate: taskId,
      updateOneRecordInput: updateInput,
    });
    await recordsQuery.refetch();
  };

  if (!hasReadPermission) {
    return {
      status: 'forbidden',
      items: [],
      hasConfigurationGap: false,
      retry: () => undefined,
      canEditDates: false,
      canEditProgress: false,
      updateTask,
    };
  }

  if (!hasConfiguredSource || !hasDateFields) {
    return {
      status: 'partial',
      items: [],
      hasConfigurationGap: true,
      configurationReason:
        (!startDateField && fieldMapping?.startDateFieldMetadataId != null) ||
        (!endDateField && fieldMapping?.dueDateFieldMetadataId != null)
          ? 'invalid-date-mapping'
          : 'missing-date-mapping',
      retry: () => undefined,
      canEditDates,
      canEditProgress,
      updateTask,
    };
  }

  const items = recordsQuery.records.map((record) =>
    toTimelineItem({
      record,
      fields: {
        title: titleFieldName,
        startDate: startDateFieldName,
        endDate: endDateFieldName,
        progress: progressFieldName,
        status: statusFieldName,
        milestone: milestoneFieldName,
        dependency: dependencyValueFieldName,
        dependencyType: dependencyTypeFieldName,
      },
    }),
  );

  if (recordsQuery.loading && items.length === 0) {
    return {
      status: 'loading',
      items,
      hasConfigurationGap: false,
      retry: () => undefined,
      canEditDates,
      canEditProgress,
      updateTask,
    };
  }

  if (recordsQuery.error && items.length === 0) {
    return {
      status: 'error',
      items,
      error: recordsQuery.error,
      hasConfigurationGap: false,
      retry: () => void recordsQuery.refetch(),
      canEditDates,
      canEditProgress,
      updateTask,
    };
  }

  if (items.length === 0) {
    return {
      status: 'empty',
      items,
      hasConfigurationGap: false,
      retry: () => void recordsQuery.refetch(),
      canEditDates,
      canEditProgress,
      updateTask,
    };
  }

  return {
    status:
      recordsQuery.error ||
      items.some((item) => !item.startDate || !item.endDate)
        ? 'partial'
        : 'ready',
    items,
    error: recordsQuery.error,
    hasConfigurationGap: false,
    retry: () => void recordsQuery.refetch(),
    canEditDates,
    canEditProgress,
    updateTask,
  };
};
