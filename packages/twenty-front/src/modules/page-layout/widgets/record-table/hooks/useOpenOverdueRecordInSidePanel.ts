import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

// Attention widgets always open details in place, without changing index navigation.
export const useOpenOverdueRecordInSidePanel = () => {
  const { recordIndexId, objectNameSingular } = useRecordIndexContextOrThrow();
  const filters = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
    recordIndexId,
  );
  const sorts = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
    recordIndexId,
  );
  const groups = useAtomComponentStateCallbackState(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const store = useStore();

  const openOverdueRecordInSidePanel = useCallback(
    ({ recordId }: { recordId: string }) => {
      if (!canOpenObjectInSidePanel(objectNameSingular)) return;
      store.set(
        contextStoreRecordShowParentViewComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        {
          parentViewComponentId: recordIndexId,
          parentViewObjectNameSingular: objectNameSingular,
          parentViewFilterGroups: store.get(groups),
          parentViewFilters: store.get(filters),
          parentViewSorts: store.get(sorts),
        },
      );
      openRecordInSidePanel({
        recordId,
        objectNameSingular,
        resetNavigationStack: true,
      });
    },
    [
      recordIndexId,
      objectNameSingular,
      groups,
      filters,
      sorts,
      store,
      openRecordInSidePanel,
    ],
  );

  return { openOverdueRecordInSidePanel };
};
