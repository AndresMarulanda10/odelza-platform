import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
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
jest.mock('@/object-metadata/hooks/useObjectMetadataItems');
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
    isActive: true,
    labelSingular: 'Task',
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
  const generic = () => {
    taskMetadata = {
      ...metadata(),
      id: 'project-object',
      nameSingular: 'project',
      namePlural: 'projects',
      labelSingular: 'Project',
      labelPlural: 'Projects',
      labelIdentifierFieldMetadataId: 'caption',
      fields: [
        idField,
        { ...start, id: 'kickoff', name: 'kickoffOn' },
        { ...due, id: 'delivery', name: 'deliveryOn' },
        {
          ...status,
          id: 'caption',
          name: 'caption',
          type: FieldMetadataType.TEXT,
        },
        status,
      ],
      readableFields: [],
    } as unknown as EnrichedObjectMetadataItem;
    taskMetadata.readableFields = taskMetadata.fields;
    query.mockReturnValue({
      records: [
        {
          id: 'project-1',
          kickoffOn: '2026-09-19',
          deliveryOn: '2026-09-20',
          caption: 'Bridge',
          status: 'DONE',
        },
      ],
      loading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useFindManyRecords>);
    return {
      ...widget({
        startDateFieldMetadataId: 'kickoff',
        dueDateFieldMetadataId: 'delivery',
      }),
      objectMetadataId: 'project-object',
    };
  };

  it('queries and edits distinct generic fields using the selected object and does not infer DONE progress', async () => {
    const configured = generic();
    const { result } = renderHook(() => useTaskTimelineData(configured));
    expect(query.mock.calls[0][0]).toMatchObject({
      objectNameSingular: 'project',
      skip: false,
    });
    expect(result.current.items[0]).toMatchObject({
      title: 'Bridge',
      progress: null,
      dependencies: [],
    });
    await result.current.updateTask!({
      taskId: 'project-1',
      startDate: '2026-09-18',
    });
    expect(updateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: 'project',
        updateOneRecordInput: { kickoffOn: '2026-09-18' },
      }),
    );
    expect(query.mock.results[0].value.refetch).not.toHaveBeenCalled();
  });

  it('does not interpret raw generic dependencies or conflict flags, and uses the record ID for an unavailable explicit title', () => {
    const configured = generic();
    (
      configured.configuration as { fieldMapping: Record<string, unknown> }
    ).fieldMapping.titleFieldMetadataId = 'foreign-title';
    query.mockReturnValue({
      records: [
        {
          id: 'project-1',
          kickoffOn: '2026-09-19',
          deliveryOn: '2026-09-20',
          conflict: true,
          dependencies: [
            {
              predecessorId: 'task-1',
              successorId: 'project-1',
              type: 'FINISH_TO_START',
              conflict: true,
            },
          ],
        },
      ],
      loading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useFindManyRecords>);
    const { result } = renderHook(() => useTaskTimelineData(configured));
    expect(result.current.items[0]).toMatchObject({
      title: 'project-1',
      conflict: false,
      dependencies: [],
    });
  });

  describe.each(['explicit', 'label-identifier'])(
    'generic %s title eligibility',
    (role) => {
      it.each([
        'date',
        'date-time',
        'stale',
        'unreadable',
        'inactive',
        'permission-denied',
      ])('falls back to record ID without extracting a %s title', (failure) => {
        const configured = generic();
        const titleId =
          failure === 'date'
            ? 'kickoff'
            : failure === 'date-time'
              ? 'delivery'
              : failure === 'stale'
                ? 'deleted-title'
                : 'caption';
        if (role === 'explicit') {
          (
            configured.configuration as {
              fieldMapping: Record<string, unknown>;
            }
          ).fieldMapping.titleFieldMetadataId = titleId;
        } else {
          taskMetadata.labelIdentifierFieldMetadataId = titleId;
        }
        if (failure === 'unreadable')
          taskMetadata.readableFields = taskMetadata.readableFields.filter(
            (field) => field.id !== 'caption',
          );
        if (failure === 'inactive') {
          taskMetadata.fields = taskMetadata.fields.map((field) =>
            field.id === 'caption' ? { ...field, isActive: false } : field,
          );
          taskMetadata.readableFields = taskMetadata.fields;
        }
        if (failure === 'permission-denied')
          jest.mocked(useObjectPermissionsForObject).mockReturnValue({
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            restrictedFields: { caption: { canRead: false } },
          } as unknown as ReturnType<typeof useObjectPermissionsForObject>);
        const extractTitle = jest.fn(() => 'Confidential title');
        const record = {
          id: 'project-1',
          kickoffOn: '2026-09-19',
          deliveryOn: '2026-09-20',
        };
        // Even a query-boundary payload containing forbidden label data must not
        // be read. Date fields remain readable for their required date roles.
        Object.defineProperty(record, 'caption', { get: extractTitle });
        query.mockReturnValue({
          records: [record],
          loading: false,
          refetch: jest.fn(),
        } as unknown as ReturnType<typeof useFindManyRecords>);
        const { result } = renderHook(() => useTaskTimelineData(configured));
        expect(result.current.status).toBe('ready');
        expect(result.current.items[0].title).toBe('project-1');
        expect(extractTitle).not.toHaveBeenCalled();
        expect(query.mock.calls[0][0].skip).toBe(false);
      });

      it.each([FieldMetadataType.TEXT, FieldMetadataType.FULL_NAME])(
        'renders a readable active %s title',
        (type) => {
          const configured = generic();
          if (role === 'explicit')
            (
              configured.configuration as {
                fieldMapping: Record<string, unknown>;
              }
            ).fieldMapping.titleFieldMetadataId = 'caption';
          taskMetadata.fields = taskMetadata.fields.map((field) =>
            field.id === 'caption' ? { ...field, type } : field,
          );
          taskMetadata.readableFields = taskMetadata.fields;
          query.mockReturnValue({
            records: [
              {
                id: 'project-1',
                kickoffOn: '2026-09-19',
                deliveryOn: '2026-09-20',
                caption:
                  type === FieldMetadataType.TEXT
                    ? 'Bridge'
                    : { firstName: 'Ada', lastName: 'Lovelace' },
              },
            ],
            loading: false,
            refetch: jest.fn(),
          } as unknown as ReturnType<typeof useFindManyRecords>);
          const { result } = renderHook(() => useTaskTimelineData(configured));
          expect(result.current.items[0].title).toBe(
            type === FieldMetadataType.TEXT ? 'Bridge' : 'Ada Lovelace',
          );
        },
      );
    },
  );

  it('enforces generic field read/update restrictions and rejects reversed dates without a mutation', async () => {
    const configured = generic();
    jest.mocked(useObjectPermissionsForObject).mockReturnValue({
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      restrictedFields: { kickoff: { canRead: true, canUpdate: false } },
    } as unknown as ReturnType<typeof useObjectPermissionsForObject>);
    const { result, rerender } = renderHook(() =>
      useTaskTimelineData(configured),
    );
    expect(result.current.canEditDates).toBe(false);
    await expect(
      result.current.updateTask!({
        taskId: 'project-1',
        startDate: '2026-09-21',
      }),
    ).rejects.toThrow('start date cannot be after');
    expect(updateOneRecord).not.toHaveBeenCalled();
    jest.mocked(useObjectPermissionsForObject).mockReturnValue({
      canReadObjectRecords: true,
      restrictedFields: { kickoff: { canRead: false } },
    } as unknown as ReturnType<typeof useObjectPermissionsForObject>);
    rerender();
    expect(result.current.status).toBe('forbidden');
    expect(query.mock.calls.at(-1)?.[0].skip).toBe(true);
  });

  it.each([null, undefined])(
    'does not discover generic required dates for %s mapping',
    (value) => {
      const configured = generic();
      configured.configuration = {
        __typename: 'TaskTimelineConfiguration',
        fieldMapping: value,
      } as PageLayoutWidget['configuration'];
      const { result } = renderHook(() => useTaskTimelineData(configured));
      expect(result.current.hasConfigurationGap).toBe(true);
      expect(query.mock.calls[0][0].skip).toBe(true);
    },
  );

  it.each([
    'missing',
    'inactive',
    'unreadable',
    'unreadable-field',
    'wrong-kind',
    'stale-field',
  ])(
    'skips generic source/field failure %s without Task fallback',
    (failure) => {
      const configured = generic();
      if (failure === 'missing') configured.objectMetadataId = 'deleted-source';
      if (failure === 'inactive') taskMetadata.isActive = false;
      if (failure === 'unreadable')
        jest
          .mocked(useObjectPermissionsForObject)
          .mockReturnValue({ canReadObjectRecords: false } as ReturnType<
            typeof useObjectPermissionsForObject
          >);
      if (failure === 'unreadable-field')
        taskMetadata.readableFields = taskMetadata.fields.filter(
          (field) => field.id !== 'kickoff',
        );
      if (failure === 'wrong-kind')
        taskMetadata.fields = taskMetadata.fields.map((field) =>
          field.id === 'kickoff'
            ? { ...field, type: FieldMetadataType.TEXT }
            : field,
        );
      if (failure === 'stale-field')
        (
          configured.configuration as {
            fieldMapping: { startDateFieldMetadataId: string };
          }
        ).fieldMapping.startDateFieldMetadataId = 'foreign-id';
      const { result } = renderHook(() => useTaskTimelineData(configured));
      expect(query.mock.calls[0][0].skip).toBe(true);
      expect(result.current.canEditDates).toBe(false);
      expect(result.current.items).toEqual([]);
      expect(result.current.status).toBe(
        ['unreadable', 'unreadable-field'].includes(failure)
          ? 'forbidden'
          : 'partial',
      );
    },
  );
  beforeEach(() => {
    jest.clearAllMocks();
    taskMetadata = metadata();
    jest
      .mocked(useObjectMetadataItems)
      .mockImplementation(() => ({ objectMetadataItems: [taskMetadata] }));
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
