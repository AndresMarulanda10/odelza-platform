import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useTaskTimelineData } from '@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock(
  '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject',
);
jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));
jest.mock('@/object-record/hooks/useObjectPermissionsForObject');
jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: jest.fn(),
}));

const start = {
  id: 'start',
  name: 'startDate',
  isActive: true,
  type: FieldMetadataType.DATE,
};
const due = {
  id: 'due',
  name: 'dueAt',
  isActive: true,
  type: FieldMetadataType.DATE_TIME,
};
const idField = {
  id: 'id-field',
  name: 'id',
  isActive: true,
  type: FieldMetadataType.UUID,
};
const status = {
  id: 'status',
  name: 'status',
  isActive: true,
  type: FieldMetadataType.SELECT,
};
const metadata = (fields = [idField, start, due, status]) =>
  ({
    id: 'task-object',
    nameSingular: 'task',
    namePlural: 'tasks',
    fields,
    readableFields: fields,
  }) as unknown as EnrichedObjectMetadataItem;
const widget = (mapping: Record<string, unknown> = {}) =>
  ({
    id: 'widget',
    objectMetadataId: 'task-object',
    configuration: {
      __typename: 'TaskTimelineConfiguration',
      fieldMapping: mapping,
    },
  }) as PageLayoutWidget;
const updateOneRecord = jest.fn();
const query = jest.mocked(useFindManyRecords);
let taskMetadata: EnrichedObjectMetadataItem;

describe('useTaskTimelineData (React/query mock integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    taskMetadata = metadata();
    jest
      .mocked(useObjectMetadataItem)
      .mockImplementation(
        () =>
          ({ objectMetadataItem: taskMetadata }) as ReturnType<
            typeof useObjectMetadataItem
          >,
      );
    jest.mocked(useGenerateDepthRecordGqlFieldsFromObject).mockReturnValue({
      recordGqlFields: {
        id: true,
        startDate: true,
        dueAt: true,
        status: true,
      },
    });
    jest.mocked(useObjectPermissionsForObject).mockReturnValue({
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      objectMetadataId: 'task-object',
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
      restrictedFields: {},
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    } as ReturnType<typeof useObjectPermissionsForObject>);
    jest
      .mocked(useUpdateOneRecord)
      .mockReturnValue({ updateOneRecord } as ReturnType<
        typeof useUpdateOneRecord
      >);
    query.mockReturnValue({
      records: [
        {
          id: 'task-1',
          startDate: '2026-09-19',
          dueAt: '2026-09-20',
          status: 'DONE',
        },
      ],
      loading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useFindManyRecords>);
  });

  it.each([undefined, null])(
    'discovers dates automatically for %s IDs and preserves stale status fallback',
    (value) => {
      const { result } = renderHook(() =>
        useTaskTimelineData(
          widget({
            startDateFieldMetadataId: value,
            dueDateFieldMetadataId: value,
            statusFieldMetadataId: 'stale',
          }),
        ),
      );
      expect(result.current).toMatchObject({
        status: 'ready',
        canEditDates: true,
        items: [{ progress: 100 }],
      });
      expect(query.mock.calls[0][0].skip).toBe(false);
    },
  );

  it('accepts explicitly configured active date kinds', () => {
    const { result } = renderHook(() =>
      useTaskTimelineData(
        widget({
          startDateFieldMetadataId: 'start',
          dueDateFieldMetadataId: 'due',
        }),
      ),
    );
    expect(result.current.status).toBe('ready');
  });

  it.each(['stale', 'cross-object', 'status', ''])(
    'does not fall back from invalid explicit ID %s',
    async (value) => {
      const { result } = renderHook(() =>
        useTaskTimelineData(widget({ startDateFieldMetadataId: value })),
      );
      expect(result.current).toMatchObject({
        status: 'partial',
        configurationReason: 'invalid-date-mapping',
        items: [],
        canEditDates: false,
        canEditProgress: false,
      });
      expect(query.mock.calls[0][0].skip).toBe(true);
      await expect(
        result.current.updateTask!({
          taskId: 'task-1',
          startDate: '2026-09-19',
        }),
      ).rejects.toThrow('editing is unavailable');
      expect(updateOneRecord).not.toHaveBeenCalled();
    },
  );

  it('rejects inactive configured dates', () => {
    taskMetadata = metadata([idField, { ...start, isActive: false }, due]);
    const { result } = renderHook(() =>
      useTaskTimelineData(widget({ startDateFieldMetadataId: 'start' })),
    );
    expect(result.current.configurationReason).toBe('invalid-date-mapping');
    expect(query.mock.calls[0][0].skip).toBe(true);
  });

  it('distinguishes missing automatic dates', () => {
    taskMetadata = metadata([idField, due]);
    const { result } = renderHook(() => useTaskTimelineData(widget()));
    expect(result.current).toMatchObject({
      status: 'partial',
      configurationReason: 'missing-date-mapping',
      canEditDates: false,
    });
  });

  it.each(['object', 'start', 'due'])(
    'blocks reads and all edits when %s read permission is denied',
    (denial) => {
      if (denial === 'object') {
        jest
          .mocked(useObjectPermissionsForObject)
          .mockReturnValue({ canReadObjectRecords: false } as ReturnType<
            typeof useObjectPermissionsForObject
          >);
      } else {
        taskMetadata.readableFields = taskMetadata.fields.filter(
          (field) => field.id !== denial,
        );
      }
      const { result } = renderHook(() => useTaskTimelineData(widget()));
      expect(result.current).toMatchObject({
        status: 'forbidden',
        items: [],
        canEditDates: false,
        canEditProgress: false,
      });
      expect(query.mock.calls[0][0].skip).toBe(true);
    },
  );

  it.each(
    [RelationType.MANY_TO_ONE, RelationType.ONE_TO_MANY].flatMap(
      (relationType) =>
        ['allowed', 'field-denied', 'target-denied'].map((permission) => ({
          relationType,
          permission,
        })),
    ),
  )(
    'uses real depth generation for $relationType with $permission permissions',
    ({ relationType, permission }) => {
      const dependency = {
        id: 'dependency',
        name: 'dependencies',
        isActive: true,
        type: FieldMetadataType.RELATION,
        settings: { relationType },
        relation: {
          type: relationType,
          targetObjectMetadata: { id: 'dependency-object' },
        },
      };
      taskMetadata = metadata([
        ...metadata().fields,
        dependency,
      ] as (typeof start)[]);
      const targetMetadata = { ...metadata(), id: 'dependency-object' };
      if (permission === 'field-denied') {
        taskMetadata.readableFields = taskMetadata.fields.filter(
          (field) => field.id !== 'dependency',
        );
      }
      jest
        .mocked(useGenerateDepthRecordGqlFieldsFromObject)
        .mockImplementation(({ depth, shouldOnlyLoadRelationIdentifiers }) => ({
          recordGqlFields: generateDepthRecordGqlFieldsFromObject({
            objectMetadataItem: taskMetadata,
            objectMetadataItems: [taskMetadata, targetMetadata],
            depth,
            shouldOnlyLoadRelationIdentifiers,
          }),
        }));
      query.mockReturnValue({
        records: [
          {
            id: 'task-1',
            startDate: '2026-09-19',
            dueAt: '2026-09-20',
            dependenciesId: 'task-0',
            dependencies: { edges: [{ node: { id: 'task-0' } }] },
          },
        ],
        loading: false,
        refetch: jest.fn(),
      } as unknown as ReturnType<typeof useFindManyRecords>);
      const { result } = renderHook(() => useTaskTimelineData(widget()));
      expect(
        jest.mocked(useGenerateDepthRecordGqlFieldsFromObject),
      ).toHaveBeenCalledWith({ objectNameSingular: 'task', depth: 0 });
      expect(result.current.items[0].dependencies).toEqual([
        {
          predecessorId: 'task-0',
          successorId: 'task-1',
          type: 'FINISH_TO_START',
          conflict: false,
        },
      ]);
      const document = generateFindManyRecordsQuery({
        objectMetadataItem: taskMetadata,
        objectMetadataItems: [taskMetadata, targetMetadata],
        recordGqlFields: query.mock.calls[0][0].recordGqlFields,
        objectPermissionsByObjectMetadataId: {
          'task-object': {
            objectMetadataId: 'task-object',
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: true,
            restrictedFields: {},
            rowLevelPermissionPredicates: [],
            rowLevelPermissionPredicateGroups: [],
          },
          'dependency-object': {
            objectMetadataId: 'dependency-object',
            canReadObjectRecords: permission !== 'target-denied',
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: true,
            restrictedFields: {},
            rowLevelPermissionPredicates: [],
            rowLevelPermissionPredicateGroups: [],
          },
        },
      });
      const printed = print(document);
      if (permission !== 'allowed') {
        expect(printed).not.toContain('dependencies');
        expect(printed).toContain('startDate');
        return;
      }
      if (relationType === RelationType.MANY_TO_ONE) {
        expect(printed).toContain('dependenciesId');
        expect(printed).not.toMatch(/dependencies\s*\{/);
      } else {
        expect(printed).toMatch(
          /dependencies\s*\{\s*edges\s*\{\s*node\s*\{\s*__typename\s*id/,
        );
        expect(printed.match(/startDate/g)).toHaveLength(1);
      }
    },
  );

  it.each(['task-0', [{ id: 'task-0' }]])(
    'preserves scalar and object-array dependency support',
    (dependencies) => {
      taskMetadata = metadata([
        ...metadata().fields,
        {
          id: 'dependency',
          name: 'dependencies',
          isActive: true,
          type: FieldMetadataType.TEXT,
        },
      ] as (typeof start)[]);
      query.mockReturnValue({
        records: [{ id: 'task-1', dependencies }],
        loading: false,
        refetch: jest.fn(),
      } as unknown as ReturnType<typeof useFindManyRecords>);
      const { result } = renderHook(() => useTaskTimelineData(widget()));
      expect(result.current.items[0].dependencies[0].predecessorId).toBe(
        'task-0',
      );
    },
  );

  it('blocks edits but keeps readable dates when updates are denied', async () => {
    jest.mocked(useObjectPermissionsForObject).mockReturnValue({
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
    } as ReturnType<typeof useObjectPermissionsForObject>);
    const { result } = renderHook(() => useTaskTimelineData(widget()));
    expect(result.current).toMatchObject({
      status: 'ready',
      canEditDates: false,
      canEditProgress: false,
    });
    expect(query.mock.calls[0][0].skip).toBe(false);
    await expect(
      result.current.updateTask!({ taskId: 'task-1', startDate: '2026-09-19' }),
    ).rejects.toThrow('Task timeline editing is unavailable');
    expect(updateOneRecord).not.toHaveBeenCalled();
  });

  it('honors a required-field read restriction even with stale readable metadata', () => {
    jest.mocked(useObjectPermissionsForObject).mockReturnValue({
      canReadObjectRecords: true,
      restrictedFields: { start: { canRead: false } },
      objectMetadataId: 'task-object',
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    } as ReturnType<typeof useObjectPermissionsForObject>);
    const { result } = renderHook(() => useTaskTimelineData(widget()));
    expect(result.current.status).toBe('forbidden');
    expect(query.mock.calls[0][0].skip).toBe(true);
  });
});
