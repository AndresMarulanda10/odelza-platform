import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import {
  CoreObjectNameSingular,
  FieldMetadataType,
  type ObjectPermissions,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  ViewFilterGroupLogicalOperator,
  ViewSortDirection,
} from '~/generated-metadata/graphql';

export const OVERDUE_TASKS_PRESET_ID = 'overdue-tasks';
export const OVERDUE_TASKS_RECORD_LIMIT = 5;

// Unlike the ordinary source picker, presets must not infer access while loading.
export const getOverdueTaskPresetObject = (
  objects: EnrichedObjectMetadataItem[],
  permissions: Record<string, ObjectPermissions>,
): EnrichedObjectMetadataItem | undefined =>
  objects.find((object) => {
    const permission = permissions[object.id];
    if (
      object.nameSingular !== CoreObjectNameSingular.Task ||
      object.universalIdentifier !==
        STANDARD_OBJECTS.task.universalIdentifier ||
      !object.isActive ||
      permission?.canReadObjectRecords !== true
    ) {
      return false;
    }

    const requiredFields = [
      ['title', FieldMetadataType.TEXT],
      ['assignee', FieldMetadataType.RELATION],
      ['dueAt', FieldMetadataType.DATE_TIME],
      ['status', FieldMetadataType.SELECT],
    ] as const;
    if (
      !requiredFields.every(([name, type]) =>
        object.readableFields.some(
          (field) =>
            field.name === name &&
            field.type === type &&
            field.isActive &&
            field.universalIdentifier ===
              STANDARD_OBJECTS.task.fields[name].universalIdentifier &&
            permission.restrictedFields?.[field.id]?.canRead !== false,
        ),
      )
    ) {
      return false;
    }

    const status = object.readableFields.find(
      (field) => field.name === 'status',
    );
    if (
      object.labelIdentifierFieldMetadataId !==
      object.readableFields.find((field) => field.name === 'title')?.id
    ) {
      return false;
    }
    return ['TODO', 'IN_PROGRESS'].every((value) =>
      status?.options?.some((option) => option.value === value),
    );
  });

export const buildOverdueTaskRecordTableWidgetPreset = (
  object: EnrichedObjectMetadataItem,
  permissions: Record<string, ObjectPermissions>,
): RecordTableWidgetViewSnapshot | undefined => {
  if (!getOverdueTaskPresetObject([object], permissions)) {
    return undefined;
  }

  const snapshot = buildRecordTableWidgetViewSnapshot(object);
  const viewId = snapshot.view.id;
  const groupId = v4();
  const fieldId = (name: string) =>
    object.readableFields.find((field) => field.name === name)!.id;
  const visibleFieldIds = ['title', 'assignee', 'dueAt'].map(fieldId);

  return {
    ...snapshot,
    view: { ...snapshot.view, name: 'Overdue tasks' },
    viewFields: snapshot.viewFields.map((field, index) => {
      const position = visibleFieldIds.indexOf(field.fieldMetadataId);
      return {
        ...field,
        isVisible: position !== -1,
        position: position === -1 ? index + 3 : position,
      };
    }),
    viewFilterGroups: [
      {
        id: groupId,
        viewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        parentViewFilterGroupId: null,
        positionInViewFilterGroup: 0,
      },
    ],
    viewFilters: [
      {
        fieldMetadataId: fieldId('dueAt'),
        operand: ViewFilterOperand.IS_BEFORE_TODAY,
        value: '',
      },
      {
        fieldMetadataId: fieldId('dueAt'),
        operand: ViewFilterOperand.IS_NOT_EMPTY,
        value: '',
      },
      {
        fieldMetadataId: fieldId('status'),
        operand: ViewFilterOperand.IS,
        value: JSON.stringify(['TODO', 'IN_PROGRESS']),
      },
    ].map((filter, position) => ({
      ...filter,
      id: v4(),
      viewId,
      viewFilterGroupId: groupId,
      positionInViewFilterGroup: position,
      subFieldName: null,
    })),
    viewSorts: [
      {
        id: v4(),
        viewId,
        fieldMetadataId: fieldId('dueAt'),
        direction: ViewSortDirection.ASC,
      },
    ],
  };
};
