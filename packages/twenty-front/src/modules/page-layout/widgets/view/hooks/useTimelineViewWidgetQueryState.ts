import { useEffect, useState } from 'react';
import { atom, useStore } from 'jotai';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { type View } from '@/views/types/View';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';

// No view fields or global record-index state are needed by the controlled timeline.
export const useTimelineViewWidgetQueryState = (
  view: View,
  objectMetadataItem: EnrichedObjectMetadataItem,
  instanceId: string,
) => {
  const store = useStore();
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );
  const savedSearch = view.anyFieldFilterValue ?? '';
  // Keep the saved-search checkpoint private to this mounted hook and update it
  // in the same transaction, without triggering another initialization effect.
  const [previousSearchAtom] = useState(() => atom<string | undefined>());
  const scope = JSON.stringify([
    instanceId,
    view.id,
    objectMetadataItem.id,
    view.viewFilters,
    view.viewFilterGroups,
    view.viewSorts,
    savedSearch,
    flattenedFieldMetadataItems,
  ]);
  const [initializedScope, setInitializedScope] = useState<string>();

  useEffect(() => {
    const filters = mapViewFiltersToFilters(
      view.viewFilters,
      flattenedFieldMetadataItems,
    );
    const groups = mapViewFilterGroupsToRecordFilterGroups(
      view.viewFilterGroups ?? [],
    );
    store.set(
      atom(null, (get, set) => {
        set(
          currentRecordFiltersComponentState.atomFamily({ instanceId }),
          filters,
        );
        set(
          currentRecordFilterGroupsComponentState.atomFamily({ instanceId }),
          groups,
        );
        set(
          currentRecordSortsComponentState.atomFamily({ instanceId }),
          view.viewSorts,
        );
        if (get(previousSearchAtom) !== savedSearch) {
          set(
            anyFieldFilterValueComponentState.atomFamily({ instanceId }),
            savedSearch,
          );
        }
        set(previousSearchAtom, savedSearch);
        set(
          contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
            instanceId,
          }),
          objectMetadataItem.id,
        );
        set(
          contextStoreCurrentViewIdComponentState.atomFamily({ instanceId }),
          view.id,
        );
        set(
          contextStoreCurrentViewTypeComponentState.atomFamily({ instanceId }),
          ContextStoreViewType.Timeline,
        );
      }),
    );
    setInitializedScope(scope);
  }, [
    store,
    scope,
    instanceId,
    view.id,
    view.viewFilters,
    view.viewFilterGroups,
    view.viewSorts,
    savedSearch,
    flattenedFieldMetadataItems,
    previousSearchAtom,
    objectMetadataItem.id,
  ]);

  // Gate on every saved-query/metadata transition, not only the first mount.
  return initializedScope === scope;
};
