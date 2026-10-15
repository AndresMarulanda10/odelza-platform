import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type PropsWithChildren } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useQueryVariablesFromParentView } from '@/views/hooks/useQueryVariablesFromParentView';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { ViewSortDirection } from '~/generated-metadata/graphql';

const task = getMockObjectMetadataItemOrThrow('task');
const parentAtom = contextStoreRecordShowParentViewComponentState.atomFamily({
  instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
});
const filter = (
  name: string,
  operand: ViewFilterOperand,
  value = '',
): RecordFilter => ({
  id: name,
  fieldMetadataId: task.fields.find((field) => field.name === name)!.id,
  type: 'DATE_TIME',
  operand,
  value,
  displayValue: '',
  label: name,
  recordFilterGroupId: 'nested',
});
const parent = {
  parentViewComponentId: 'native-table',
  parentViewObjectNameSingular: 'task',
  parentViewFilters: [
    filter('dueAt', ViewFilterOperand.IS_NOT_EMPTY),
    filter('deletedAt', ViewFilterOperand.IS_NOT_EMPTY),
  ],
  parentViewFilterGroups: [
    { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.AND },
    {
      id: 'nested',
      parentRecordFilterGroupId: 'root',
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
    },
  ],
  parentViewSorts: [
    {
      id: 'sort',
      fieldMetadataId: task.fields.find((field) => field.name === 'dueAt')!.id,
      direction: ViewSortDirection.ASC,
    },
  ],
};

describe('parent-view query object isolation', () => {
  it.each(['dashboard', '', undefined])(
    'resets filters, nested groups, sorts and soft-delete state for parent identity %s',
    (identity) => {
      const store = createStore();
      setTestObjectMetadataItemsInMetadataStore(
        store,
        getTestEnrichedObjectMetadataItemsMock(),
      );
      const wrapper = ({ children }: PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      );
      const { result } = renderHook(
        () => useQueryVariablesFromParentView({ objectMetadataItem: task }),
        { wrapper },
      );
      const empty = result.current;
      act(() => store.set(parentAtom, parent));
      expect(JSON.stringify(result.current.filter)).toMatch(/dueAt/);
      expect(JSON.stringify(result.current.orderBy)).toMatch(/dueAt/);
      expect(result.current.isSoftDeleteFilterActive).toBe(true);
      // Legacy persisted state can lack the now-required object identity.
      act(() =>
        store.set(parentAtom, {
          ...parent,
          parentViewObjectNameSingular: identity,
        } as typeof parent),
      );
      expect(result.current).toEqual(empty);
      expect(result.current.isSoftDeleteFilterActive).toBe(false);
      act(() => store.set(parentAtom, parent));
      expect(result.current.isSoftDeleteFilterActive).toBe(true);
      act(() => store.set(parentAtom, null));
      expect(result.current).toEqual(empty);
    },
  );
});
