import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { type View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';

export const getViewType = ({
  isRecordIndexPage,
  view,
}: {
  isRecordIndexPage: boolean;
  view?: View;
}) => {
  if (isRecordIndexPage) {
    if (view?.type === ViewType.TIMELINE) return ContextStoreViewType.Timeline;
    return view?.type === ViewType.KANBAN
      ? ContextStoreViewType.Kanban
      : ContextStoreViewType.Table;
  }

  return null;
};
