import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import { buildRecordTableWidgetViewSnapshotFromView } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshotFromView';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { type View } from '@/views/types/View';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';

type UseInitializeRecordTableWidgetViewDraftParams = {
  widgetId: string;
  view: View | undefined;
  pageLayoutId?: string;
  allowEmptyFields?: boolean;
};

export const useInitializeRecordTableWidgetViewDraft = ({
  widgetId,
  view,
  pageLayoutId,
  allowEmptyFields = false,
}: UseInitializeRecordTableWidgetViewDraftParams) => {
  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const recordTableWidgetViewPersistedState =
    useAtomComponentStateCallbackState(
      recordTableWidgetViewPersistedComponentState,
      pageLayoutId,
    );

  const store = useStore();

  const initializeDraft = useCallback(() => {
    const currentDraft = store.get(recordTableWidgetViewDraftState);

    if (!view) return;

    const existing = currentDraft[widgetId];
    if (
      existing &&
      (!allowEmptyFields ||
        (existing.view.id === view.id &&
          existing.view.objectMetadataId === view.objectMetadataId))
    ) {
      return;
    }

    if (!allowEmptyFields && view.viewFields.length === 0) {
      return;
    }

    const snapshot = buildRecordTableWidgetViewSnapshotFromView(view);

    store.set(recordTableWidgetViewDraftState, (prev) => ({
      ...prev,
      [widgetId]: snapshot,
    }));

    store.set(recordTableWidgetViewPersistedState, (prev) => ({
      ...prev,
      [widgetId]: snapshot,
    }));
  }, [
    recordTableWidgetViewDraftState,
    recordTableWidgetViewPersistedState,
    widgetId,
    view,
    allowEmptyFields,
    store,
  ]);

  useEffect(initializeDraft, [initializeDraft]);
};
