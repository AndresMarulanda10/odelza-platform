import { renderHook } from '@testing-library/react';
import {
  useFindManyRecordIndexTableParams,
  useFindManyTimelineViewParams,
} from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useRecordGroupFilter } from '@/object-record/record-group/hooks/useRecordGroupFilter';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { combineFilters } from 'twenty-shared/utils';

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: { id: 'tasks', fields: [] },
  }),
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));
jest.mock('@/object-record/record-group/hooks/useRecordGroupFilter', () => ({
  useRecordGroupFilter: jest.fn(() => ({ recordGroupFilter: { group: true } })),
}));
jest.mock(
  '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition',
  () => ({
    useCurrentRecordGroupDefinition: jest.fn(() => ({ id: 'inherited-group' })),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({ useAtomComponentStateValue: jest.fn(() => []) }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => [],
}));
jest.mock(
  '@/object-record/record-filter/hooks/useFilterValueDependencies',
  () => ({
    useFilterValueDependencies: () => ({ filterValueDependencies: {} }),
  }),
);
jest.mock(
  '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy',
  () => ({ turnSortsIntoOrderBy: () => [{ title: 'AscNullsFirst' }] }),
);
jest.mock('twenty-shared/utils', () => ({
  ...jest.requireActual('twenty-shared/utils'),
  computeRecordGqlOperationFilter: () => ({ saved: true }),
  turnAnyFieldFilterIntoRecordGqlFilter: () => ({
    recordGqlOperationFilter: { search: true },
  }),
  combineFilters: jest.fn((filters) => ({ and: filters })),
}));

beforeEach(() => jest.clearAllMocks());

it('composes scoped filters, sorts and search without invoking inherited group hooks or limiting to eight', () => {
  const { result } = renderHook(() =>
    useFindManyTimelineViewParams('task', 'timeline-instance'),
  );
  expect(result.current).toEqual({
    objectNameSingular: 'task',
    filter: { and: [{ saved: true }, { search: true }] },
    orderBy: [{ title: 'AscNullsFirst' }],
  });
  expect(useRecordGroupFilter).not.toHaveBeenCalled();
  expect(useCurrentRecordGroupDefinition).not.toHaveBeenCalled();
  expect(jest.mocked(useAtomComponentStateValue).mock.calls).toHaveLength(4);
  for (const call of jest.mocked(useAtomComponentStateValue).mock.calls)
    expect(call[1]).toBe('timeline-instance');
});

it('preserves the table filter argument order and grouped page limit', () => {
  const { result } = renderHook(() =>
    useFindManyRecordIndexTableParams('task', 'table-instance'),
  );
  expect(combineFilters).toHaveBeenCalledWith([
    { saved: true },
    { group: true },
    { search: true },
  ]);
  expect(result.current).toEqual({
    objectNameSingular: 'task',
    filter: { and: [{ saved: true }, { group: true }, { search: true }] },
    orderBy: [{ title: 'AscNullsFirst' }],
    limit: 8,
  });
});
