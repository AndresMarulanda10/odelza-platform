import { useEffect, useRef, useState } from 'react';
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
  const fields = useAtomStateValue(flattenedFieldMetadataItemsSelector);
  const savedSearch = view.anyFieldFilterValue ?? '';
  const previousSearch = useRef<string | undefined>(undefined);
  const scope = JSON.stringify([
    instanceId,
    view.id,
    objectMetadataItem.id,
    view.viewFilters,
    view.viewFilterGroups,
    view.viewSorts,
    savedSearch,
    fields,
  ]);
  const [initializedScope, setInitializedScope] = useState<string>();

  useEffect(() => {
    const filters = mapViewFiltersToFilters(view.viewFilters, fields);
    const groups = mapViewFilterGroupsToRecordFilterGroups(
      view.viewFilterGroups ?? [],
    );
    store.set(
      atom(null, (_get, set) => {
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
        if (previousSearch.current !== savedSearch) {
          set(
            anyFieldFilterValueComponentState.atomFamily({ instanceId }),
            savedSearch,
          );
        }
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
    previousSearch.current = savedSearch;
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
    fields,
    objectMetadataItem.id,
  ]);

  // Gate on every saved-query/metadata transition, not only the first mount.
  return initializedScope === scope;
};
