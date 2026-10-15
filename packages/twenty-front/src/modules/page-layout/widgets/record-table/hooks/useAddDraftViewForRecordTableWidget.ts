import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const useAddDraftViewForRecordTableWidget = (pageLayoutId: string) => {
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const addDraftViewForRecordTableWidget = useCallback(
    (
      widgetId: string,
      objectMetadataItem: EnrichedObjectMetadataItem,
      initialView?: {
        snapshot: RecordTableWidgetViewSnapshot;
        recordLimit: number;
        presentationMode?: 'TABLE' | 'OVERDUE_ATTENTION';
      },
    ) => {
      const snapshot =
        initialView?.snapshot ??
        buildRecordTableWidgetViewSnapshot(objectMetadataItem);

      store.set(recordTableWidgetViewDraftState, (prev) => ({
        ...prev,
        [widgetId]: snapshot,
      }));

      requestAnimationFrame(() => {
        // A source switch or cancellation may supersede this deferred draft.
        if (store.get(recordTableWidgetViewDraftState)[widgetId] !== snapshot) {
          return;
        }
        updatePageLayoutWidget(widgetId, {
          configuration: {
            configurationType: WidgetConfigurationType.RECORD_TABLE,
            viewId: snapshot.view.id,
            presentationMode: initialView?.presentationMode ?? 'TABLE',
            ...(initialView ? { recordLimit: initialView.recordLimit } : {}),
          },
        });
      });
    },
    [store, recordTableWidgetViewDraftState, updatePageLayoutWidget],
  );

  return { addDraftViewForRecordTableWidget };
};
