import { act, renderHook, waitFor } from '@testing-library/react';
import { useOverdueAttentionRecords } from '@/page-layout/widgets/record-table/hooks/useOverdueAttentionRecords';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { buildOverdueTaskRecordTableWidgetPreset } from '@/page-layout/widgets/record-table/utils/buildOverdueTaskRecordTableWidgetPreset';
import { type ObjectPermissions } from 'twenty-shared/types';
import { Temporal } from 'temporal-polyfill';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { print } from 'graphql';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';

const mockTask = getMockObjectMetadataItemOrThrow('task');
const mockPermissions: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};
const mockSnapshot = buildOverdueTaskRecordTableWidgetPreset(mockTask, {
  [mockTask.id]: mockPermissions,
})!;
let mockRecordIndexId = 'native-widget-view';
let mockAnyField = '';
const mockFind = jest.fn();
const mockMore = jest.fn();
const mockNativeQuery = jest.fn((params) => ({
  queryIdentifier: getQueryIdentifier(params),
  findManyRecordsLazy: mockFind,
  fetchMoreRecordsLazy: mockMore,
}));
jest.mock('@/object-record/hooks/useLazyFindManyRecords', () => ({
  useLazyFindManyRecords: (params: unknown) => mockNativeQuery(params),
}));
jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => ({
    objectMetadataItem: mockTask,
    objectNameSingular: 'task',
    recordIndexId: mockRecordIndexId,
  }),
}));
jest.mock(
  '@/object-record/record-field/hooks/useRelevantRecordsGqlFields',
  () => ({
    useRelevantRecordsGqlFields: () => ({
      id: true,
      title: true,
      dueAt: true,
      status: true,
      privateField: true,
      assignee: { id: true, name: true, privateField: true },
    }),
  }),
);
jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem: mockTask }),
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [mockTask] }),
}));
jest.mock('@/object-record/record-group/hooks/useRecordGroupFilter', () => ({
  useRecordGroupFilter: () => ({
    recordGroupFilter: { id: { neq: 'group-exclusion' } },
  }),
}));
jest.mock(
  '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition',
  () => ({ useCurrentRecordGroupDefinition: () => undefined }),
);
jest.mock(
  '@/object-record/record-filter/hooks/useFilterValueDependencies',
  () => ({
    useFilterValueDependencies: () => ({
      filterValueDependencies: { timeZone: 'America/New_York' },
    }),
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => mockTask.fields,
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: (state: unknown) => {
      if (state === currentRecordFiltersComponentState)
        return mapViewFiltersToFilters(
          mockSnapshot.viewFilters,
          mockTask.fields,
        );
      if (state === currentRecordFilterGroupsComponentState)
        return mapViewFilterGroupsToRecordFilterGroups(
          mockSnapshot.viewFilterGroups,
        );
      if (state === currentRecordSortsComponentState)
        return mockSnapshot.viewSorts;
      return mockAnyField;
    },
  }),
);

const records = (...ids: string[]) =>
  ids.map((id) => ({ id, title: id, dueAt: '2026-10-12T00:00:00Z' }));
const page = (ids: string[], totalCount = 18) => ({
  data: { tasks: {} },
  records: records(...ids),
  totalCount,
  hasNextPage: true,
  error: undefined,
});
const deferred = () => {
  let resolve!: (value: ReturnType<typeof page>) => void;
  const promise = new Promise<ReturnType<typeof page>>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

describe('native overdue attention adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRecordIndexId = 'native-widget-view';
    mockAnyField = '';
    mockFind.mockResolvedValue(page(['1', '2', '3', '4', '5']));
    jest
      .spyOn(Temporal.Now, 'zonedDateTimeISO')
      .mockReturnValue(
        Temporal.Instant.from('2026-10-14T16:00:00Z').toZonedDateTimeISO(
          'America/New_York',
        ),
      );
  });
  afterEach(() => jest.restoreAllMocks());

  it('executes real native group/filter/sort params with exact required guards and uncapped count; selects only identifiers', async () => {
    const { result } = renderHook(() =>
      useOverdueAttentionRecords({ id: true, name: true }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.totalCount).toBe(18);
    expect(result.current.records).toHaveLength(5);
    const params = mockNativeQuery.mock.calls.at(-1)![0];
    expect(params.limit).toBe(5);
    expect(params.orderBy).toEqual([
      { dueAt: 'AscNullsFirst' },
      { position: 'AscNullsFirst' },
    ]);
    const serialized = JSON.stringify(params.filter);
    expect(serialized).toContain('2026-10-14T04:00:00Z');
    expect(serialized).toContain('TODO');
    expect(serialized).toContain('IN_PROGRESS');
    expect(serialized).toContain('NULL');
    expect(serialized).toContain('group-exclusion');
    expect(params.recordGqlFields).toEqual({
      id: true,
      title: true,
      dueAt: true,
      status: true,
      assignee: { id: true, name: true },
    });
    const member = getMockObjectMetadataItemOrThrow('workspaceMember');
    const document = generateFindManyRecordsQuery({
      objectMetadataItem: mockTask,
      objectMetadataItems: [mockTask, member],
      recordGqlFields: params.recordGqlFields,
      objectPermissionsByObjectMetadataId: {
        [mockTask.id]: { ...mockPermissions, objectMetadataId: mockTask.id },
        [member.id]: { ...mockPermissions, objectMetadataId: member.id },
      },
    });
    const query = print(document);
    expect(query).toContain('totalCount');
    expect(query).toMatch(
      /tasks\(\s*filter: \$filter\s*orderBy: \$orderBy\s*first: \$limit\s*after: \$lastCursor/,
    );
    expect(query).toContain('assignee {');
    expect(query).not.toContain('privateField');
  });

  it('deduplicates pages, serializes requests and retries failed pagination without clearing authorized rows/count', async () => {
    const pending = deferred();
    mockMore.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useOverdueAttentionRecords());
    await waitFor(() => expect(result.current.loading).toBe(false));
    let first!: Promise<void>;
    act(() => {
      first = result.current.loadMore();
      void result.current.loadMore();
    });
    expect(mockMore).toHaveBeenCalledTimes(1);
    expect(mockMore).toHaveBeenCalledWith(25);
    await act(async () => {
      pending.resolve({
        ...page(['5', '6']),
        data: { pageInfo: { hasNextPage: true } },
      } as never);
      await first;
    });
    expect(result.current.records.map((record) => record.id)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
    ]);
    mockMore.mockResolvedValueOnce({ error: new Error('offline') });
    await act(async () => result.current.loadMore());
    expect(result.current.error).toBe(true);
    expect(result.current.totalCount).toBe(18);
    expect(result.current.records).toHaveLength(6);
    mockMore.mockResolvedValueOnce({
      records: records('7'),
      totalCount: 18,
      data: { pageInfo: { hasNextPage: false } },
    });
    await act(async () => result.current.loadMore());
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.error).toBe(false);
    expect(result.current.records).toHaveLength(7);
  });

  it('clears stale records/count synchronously on source/query identity changes and ignores late responses', async () => {
    const old = deferred();
    mockFind.mockReturnValueOnce(old.promise);
    const { result, rerender } = renderHook(() => useOverdueAttentionRecords());
    mockRecordIndexId = 'other-view';
    mockFind.mockResolvedValueOnce(page(['new'], 1));
    rerender();
    await waitFor(() => expect(result.current.records[0]?.id).toBe('new'));
    await act(async () => {
      old.resolve(page(['private-old'], 99));
    });
    expect(result.current.totalCount).toBe(1);
    expect(result.current.records[0].id).toBe('new');
    const next = deferred();
    mockFind.mockReturnValueOnce(next.promise);
    mockAnyField = 'search';
    rerender();
    expect(result.current.records).toEqual([]);
    expect(result.current.totalCount).toBeNull();
    await act(async () => {
      next.resolve(page([], 0));
    });
    expect(result.current.totalCount).toBe(0);
  });

  it('keeps initial errors distinct from successful empty and supports retry', async () => {
    mockFind.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useOverdueAttentionRecords());
    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current.totalCount).toBeNull();
    mockFind.mockResolvedValueOnce(page([], 0));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.totalCount).toBe(0));
    expect(result.current.error).toBe(false);
  });
});
