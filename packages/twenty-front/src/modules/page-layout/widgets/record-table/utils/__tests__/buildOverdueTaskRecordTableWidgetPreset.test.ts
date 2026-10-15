import {
  buildOverdueTaskRecordTableWidgetPreset,
  getOverdueTaskPresetObject,
} from '@/page-layout/widgets/record-table/utils/buildOverdueTaskRecordTableWidgetPreset';
import { type ObjectPermissions, ViewFilterOperand } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { turnRecordFilterIntoRecordGqlOperationFilter } from 'twenty-shared/utils';
import { Temporal } from 'temporal-polyfill';

const task = getMockObjectMetadataItemOrThrow('task');
const permissions: Record<string, ObjectPermissions> = {
  [task.id]: {
    canReadObjectRecords: true,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
};

describe('Overdue tasks native preset', () => {
  afterEach(() => jest.restoreAllMocks());
  it('builds the exact executable native GraphQL predicate (no null status or due date)', () => {
    jest
      .spyOn(Temporal.Now, 'zonedDateTimeISO')
      .mockReturnValue(
        Temporal.Instant.from('2026-10-14T16:00:00Z').toZonedDateTimeISO('UTC'),
      );
    const snapshot = buildOverdueTaskRecordTableWidgetPreset(
      task,
      permissions,
    )!;
    const filters = snapshot.viewFilters.map((filter) =>
      turnRecordFilterIntoRecordGqlOperationFilter({
        recordFilter: {
          fieldMetadataId: filter.fieldMetadataId,
          operand: filter.operand,
          value: filter.value,
          type: task.fields.find(
            (field) => field.id === filter.fieldMetadataId,
          )!.type as 'DATE_TIME' | 'SELECT',
        },
        fieldMetadataItemById: new Map(
          task.fields.map((field) => [field.id, field]),
        ),
        filterValueDependencies: { timeZone: 'UTC' },
      }),
    );
    expect(filters).toEqual([
      { dueAt: { lt: '2026-10-14T00:00:00Z' } },
      { not: { dueAt: { is: 'NULL' } } },
      { status: { in: ['TODO', 'IN_PROGRESS'] } },
    ]);
    // SQL/GraphQL lt and in do not match NULL: enforce the complete conjunction.
    const matches = (dueAt: string | null, status: string | null) =>
      dueAt !== null &&
      status !== null &&
      dueAt < '2026-10-14T00:00:00Z' &&
      ['TODO', 'IN_PROGRESS'].includes(status);
    for (const status of ['TODO', 'IN_PROGRESS']) {
      expect(matches('2026-10-13T23:59:59Z', status)).toBe(true);
      expect(matches('2026-10-14T00:00:00Z', status)).toBe(false);
      expect(matches('2026-10-14T10:00:00Z', status)).toBe(false);
      expect(matches(null, status)).toBe(false);
    }
    for (const status of [null, 'DONE', 'CUSTOM']) {
      expect(matches('2026-10-13T23:59:59Z', status)).toBe(false);
    }
  });
  it('creates the native snapshot using actual field IDs, three columns, AND predicates and due-date sorting', () => {
    const snapshot = buildOverdueTaskRecordTableWidgetPreset(
      task,
      permissions,
    )!;
    expect(snapshot).toBeDefined();
    expect(snapshot.view.name).toBe('Overdue tasks');
    expect(snapshot.view.type).toBe('TABLE_WIDGET');
    const names = (id: string) =>
      task.fields.find((field) => field.id === id)!.name;
    expect(
      snapshot.viewFields
        .filter((field) => field.isVisible)
        .sort((a, b) => a.position - b.position)
        .map((field) => names(field.fieldMetadataId)),
    ).toEqual(['title', 'assignee', 'dueAt']);
    expect(snapshot.viewFilterGroups).toEqual([
      {
        id: expect.any(String),
        viewId: snapshot.view.id,
        logicalOperator: 'AND',
        parentViewFilterGroupId: null,
        positionInViewFilterGroup: 0,
      },
    ]);
    expect(
      snapshot.viewFilters.map((filter) => [
        names(filter.fieldMetadataId),
        filter.operand,
        filter.value,
      ]),
    ).toEqual([
      ['dueAt', ViewFilterOperand.IS_BEFORE_TODAY, ''],
      ['dueAt', ViewFilterOperand.IS_NOT_EMPTY, ''],
      ['status', ViewFilterOperand.IS, '["TODO","IN_PROGRESS"]'],
    ]);
    expect(
      snapshot.viewFilters.every(
        (filter) =>
          filter.viewFilterGroupId === snapshot.viewFilterGroups[0].id &&
          filter.viewId === snapshot.view.id,
      ),
    ).toBe(true);
    expect(snapshot.viewSorts).toEqual([
      {
        id: expect.any(String),
        viewId: snapshot.view.id,
        fieldMetadataId: task.fields.find((field) => field.name === 'dueAt')!
          .id,
        direction: 'ASC',
      },
    ]);
  });

  it('fails closed during initial metadata and permission loading', () => {
    expect(getOverdueTaskPresetObject([], permissions)).toBeUndefined();
    expect(buildOverdueTaskRecordTableWidgetPreset(task, {})).toBeUndefined();
    expect(
      buildOverdueTaskRecordTableWidgetPreset(task, {
        [task.id]: { ...permissions[task.id], canReadObjectRecords: false },
      }),
    ).toBeUndefined();
  });

  it.each(['title', 'assignee', 'dueAt', 'status'])(
    'requires active readable %s metadata and field permissions',
    (name) => {
      const field = task.fields.find((item) => item.name === name)!;
      expect(
        buildOverdueTaskRecordTableWidgetPreset(
          {
            ...task,
            readableFields: task.readableFields.filter(
              (item) => item.id !== field.id,
            ),
          },
          permissions,
        ),
      ).toBeUndefined();
      expect(
        buildOverdueTaskRecordTableWidgetPreset(task, {
          [task.id]: {
            ...permissions[task.id],
            restrictedFields: { [field.id]: { canRead: false } },
          },
        }),
      ).toBeUndefined();
      expect(
        buildOverdueTaskRecordTableWidgetPreset(
          {
            ...task,
            readableFields: task.readableFields.map((item) =>
              item.id === field.id ? { ...item, isActive: false } : item,
            ),
          },
          permissions,
        ),
      ).toBeUndefined();
    },
  );

  it('does not infer native status values from labels or arbitrary custom sources', () => {
    const changed = {
      ...task,
      readableFields: task.readableFields.map((field) =>
        field.name === 'status'
          ? {
              ...field,
              options: field.options?.map((option) => ({
                ...option,
                value: option.value === 'TODO' ? 'CUSTOM_TODO' : option.value,
              })),
            }
          : field,
      ),
    };
    expect(
      buildOverdueTaskRecordTableWidgetPreset(changed, permissions),
    ).toBeUndefined();
    expect(
      buildOverdueTaskRecordTableWidgetPreset(
        { ...task, universalIdentifier: 'custom-task' },
        permissions,
      ),
    ).toBeUndefined();
    expect(
      buildOverdueTaskRecordTableWidgetPreset(
        { ...task, isActive: false },
        permissions,
      ),
    ).toBeUndefined();
    expect(
      buildOverdueTaskRecordTableWidgetPreset(
        getMockObjectMetadataItemOrThrow('company'),
        permissions,
      ),
    ).toBeUndefined();
  });
});
