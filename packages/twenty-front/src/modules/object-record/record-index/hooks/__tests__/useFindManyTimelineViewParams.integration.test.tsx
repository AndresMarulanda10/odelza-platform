import { act, renderHook } from '@testing-library/react';
import { useStore } from 'jotai';
import { type ReactNode } from 'react';
import { useFindManyTimelineViewParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useGetBrowsingContext } from '@/ai/hooks/useBrowsingContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import {
  ContextStorePageType,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { ViewSortDirection } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

// Only saved-view metadata is a fixture; store reads and parser calls are real.
jest.mock('@/views/states/selectors/viewFromViewIdFamilySelector', () => {
  const { atom } = jest.requireActual('jotai');
  const viewAtom = atom({ id: 'planning', name: 'Planning' });
  return { viewFromViewIdFamilySelector: { selectorFamily: () => viewAtom } };
});

const originalTask = getMockObjectMetadataItemOrThrow('task');
const title = originalTask.fields.find((field) => field.name === 'title')!;
const task = { ...originalTask, fields: [title], readableFields: [title] };
const filter = (value: string, grouped = false) => ({
  id: `filter-${value}`,
  fieldMetadataId: title.id,
  value,
  displayValue: value,
  type: 'TEXT' as const,
  operand: ViewFilterOperand.CONTAINS,
  label: 'Title',
  ...(grouped
    ? { recordFilterGroupId: 'root', positionInRecordFilterGroup: 0 }
    : {}),
});
const state = (instanceId: string) => ({
  filters: currentRecordFiltersComponentState.atomFamily({ instanceId }),
  groups: currentRecordFilterGroupsComponentState.atomFamily({ instanceId }),
  sorts: currentRecordSortsComponentState.atomFamily({ instanceId }),
  search: anyFieldFilterValueComponentState.atomFamily({ instanceId }),
});
const a = state('timeline-a');
const b = state('timeline-b');
const expected = (
  saved: string,
  search: string,
  direction: string,
  grouped = false,
) => ({
  objectNameSingular: 'task',
  filter: {
    and: [
      grouped
        ? { or: [{ title: { ilike: `%${saved}%` } }] }
        : { title: { ilike: `%${saved}%` } },
      { or: [{ title: { ilike: `%${search}%` } }] },
    ],
  },
  orderBy: [{ title: direction }],
});

it('isolates real filter, group, sort and search atom transitions', () => {
  const Metadata = getJestMetadataAndApolloMocksWrapper({
    objectMetadataItems: [task, getMockObjectMetadataItemOrThrow('company')],
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Metadata>
      <RecordGroupContext.Provider value={{ recordGroupId: 'inherited' }}>
        {children}
      </RecordGroupContext.Provider>
    </Metadata>
  );
  const { result } = renderHook(
    () => ({
      store: useStore(),
      a: useFindManyTimelineViewParams('task', 'timeline-a'),
      b: useFindManyTimelineViewParams('task', 'timeline-b'),
    }),
    { wrapper },
  );
  const store = result.current.store;
  act(() => {
    store.set(recordGroupDefinitionFamilyState.atomFamily('inherited'), {
      id: 'inherited',
      type: RecordGroupDefinitionType.Value,
      title: 'Hidden group',
      value: 'ignored',
      color: 'blue',
      position: 0,
      isVisible: true,
    });
    for (const [scope, value, search] of [
      [a, 'alpha', 'needle-a'],
      [b, 'bravo', 'needle-b'],
    ] as const) {
      store.set(scope.filters, [filter(value)]);
      store.set(scope.groups, []);
      store.set(scope.sorts, [
        {
          id: 'title-sort',
          fieldMetadataId: title.id,
          direction: ViewSortDirection.ASC,
        },
      ]);
      store.set(scope.search, search);
    }
  });
  expect(result.current.a).toEqual(
    expected('alpha', 'needle-a', 'AscNullsFirst'),
  );
  expect(result.current.b).toEqual(
    expected('bravo', 'needle-b', 'AscNullsFirst'),
  );
  const beforeB = [
    store.get(b.filters),
    store.get(b.groups),
    store.get(b.sorts),
    store.get(b.search),
  ];
  const queryB = result.current.b;
  act(() => {
    store.set(a.filters, [filter('changed', true)]);
    store.set(a.groups, [
      { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.OR },
    ]);
    store.set(a.sorts, [
      {
        id: 'title-sort',
        fieldMetadataId: title.id,
        direction: ViewSortDirection.DESC,
      },
    ]);
    store.set(a.search, 'new-search');
  });
  expect(result.current.a).toEqual(
    expected('changed', 'new-search', 'DescNullsLast', true),
  );
  expect(result.current.a).not.toHaveProperty('limit');
  expect(result.current.b).toEqual(queryB);
  expect([
    store.get(b.filters),
    store.get(b.groups),
    store.get(b.sorts),
    store.get(b.search),
  ]).toEqual(beforeB);
  for (const [index, value] of [
    store.get(b.filters),
    store.get(b.groups),
    store.get(b.sorts),
    store.get(b.search),
  ].entries())
    expect(value).toBe(beforeB[index]);
  act(() => {
    store.set(a.filters, []);
    store.set(a.groups, []);
    store.set(a.sorts, []);
    store.set(a.search, '');
  });
  expect(result.current.a).toEqual({
    objectNameSingular: 'task',
    filter: {},
    orderBy: [],
  });
  expect(result.current.b).toEqual(queryB);
});

it('reads real table/timeline/kanban browsing context transitions without remounting', () => {
  const wrapper = getJestMetadataAndApolloMocksWrapper({});
  const { result } = renderHook(
    () => ({ store: useStore(), browsing: useGetBrowsingContext() }),
    { wrapper },
  );
  const store = result.current.store;
  const instanceId = MAIN_CONTEXT_STORE_INSTANCE_ID;
  act(() => {
    store.set(
      contextStoreCurrentPageTypeComponentState.atomFamily({ instanceId }),
      ContextStorePageType.Index,
    );
    store.set(
      contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
        instanceId,
      }),
      originalTask.id,
    );
    store.set(
      contextStoreCurrentViewIdComponentState.atomFamily({ instanceId }),
      'planning',
    );
    store.set(contextStoreFiltersComponentState.atomFamily({ instanceId }), [
      filter('Open'),
    ]);
  });
  const getContext = result.current.browsing.getBrowsingContext;
  for (const type of [
    ContextStoreViewType.Table,
    ContextStoreViewType.Timeline,
    ContextStoreViewType.Kanban,
    ContextStoreViewType.Table,
  ]) {
    act(() =>
      store.set(
        contextStoreCurrentViewTypeComponentState.atomFamily({ instanceId }),
        type,
      ),
    );
    expect(getContext()).toEqual({
      type: 'listView',
      objectNameSingular: 'task',
      viewId: 'planning',
      viewName: 'Planning',
      filterDescriptions: ['Title CONTAINS "Open"'],
    });
  }
});
