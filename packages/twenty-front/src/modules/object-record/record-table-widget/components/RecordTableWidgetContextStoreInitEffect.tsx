import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';
import { ViewType } from '~/generated-metadata/graphql';

type RecordTableWidgetContextStoreInitEffectProps = {
  objectMetadataItemId: string;
  viewId: string;
  viewType?: ViewType;
};

export const RecordTableWidgetContextStoreInitEffect = ({
  objectMetadataItemId,
  viewId,
  viewType = ViewType.TABLE,
}: RecordTableWidgetContextStoreInitEffectProps) => {
  const setContextStoreCurrentObjectMetadataItemId = useSetAtomComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const setContextStoreCurrentViewId = useSetAtomComponentState(
    contextStoreCurrentViewIdComponentState,
  );

  const setContextStoreCurrentViewType = useSetAtomComponentState(
    contextStoreCurrentViewTypeComponentState,
  );

  useEffect(() => {
    setContextStoreCurrentObjectMetadataItemId(objectMetadataItemId);
    setContextStoreCurrentViewId(viewId);
    setContextStoreCurrentViewType(
      viewType === ViewType.KANBAN
        ? ContextStoreViewType.Kanban
        : ContextStoreViewType.Table,
    );
  }, [
    objectMetadataItemId,
    viewId,
    viewType,
    setContextStoreCurrentObjectMetadataItemId,
    setContextStoreCurrentViewId,
    setContextStoreCurrentViewType,
  ]);

  return null;
};
