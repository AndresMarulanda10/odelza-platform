import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { RecordTableWidget } from '@/object-record/record-table-widget/components/RecordTableWidget';
import { RecordTableWidgetProvider } from '@/object-record/record-table-widget/components/RecordTableWidgetProvider';
import { RecordTableWidgetViewDraftInitEffect } from '@/page-layout/widgets/record-table/components/RecordTableWidgetViewDraftInitEffect';
import { OverdueAttentionViewGate } from '@/page-layout/widgets/record-table/components/OverdueAttentionViewGate';
import { useRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { TimelineViewWidget } from '@/page-layout/widgets/view/components/TimelineViewWidget';

type RecordTableTimelineProps = Pick<
  RecordTableWidgetRendererContentProps,
  'objectMetadataId' | 'viewId' | 'widgetId' | 'recordLimit'
>;

const RecordTableTimeline = ({
  objectMetadataId,
  viewId,
  widgetId,
  recordLimit,
}: RecordTableTimelineProps) => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });
  const { view } = useRecordTableWidgetViewForDisplay({
    pageLayoutId,
    widgetId,
    viewId,
  });
  if (!view || view.objectMetadataId !== objectMetadataId) return null;
  return (
    <TimelineViewWidget
      view={view}
      objectMetadataItem={objectMetadataItem}
      widgetId={widgetId}
      recordLimit={recordLimit}
    />
  );
};

type RecordTableWidgetRendererContentProps = {
  objectMetadataId: string;
  viewId: string;
  widgetId: string;
  isReadOnly?: boolean;
  isEmptyStateHidden?: boolean;
  recordLimit?: number;
  presentationMode?: string | null;
};

export const RecordTableWidgetRendererContent = ({
  objectMetadataId,
  viewId,
  widgetId,
  isReadOnly = true,
  isEmptyStateHidden = false,
  recordLimit,
  presentationMode,
}: RecordTableWidgetRendererContentProps) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  return (
    <>
      <RecordTableWidgetViewDraftInitEffect
        widgetId={widgetId}
        viewId={viewId}
      />
      {presentationMode === 'TIMELINE' ? (
        <RecordTableTimeline
          objectMetadataId={objectMetadataId}
          viewId={viewId}
          widgetId={widgetId}
          recordLimit={recordLimit}
        />
      ) : (
        <RecordTableWidgetProvider
          objectNameSingular={objectMetadataItem.nameSingular}
          viewId={viewId}
          widgetId={widgetId}
          recordLimit={recordLimit}
        >
          {presentationMode === 'OVERDUE_ATTENTION' ? (
            <OverdueAttentionViewGate viewId={viewId} />
          ) : (
            <RecordTableWidget
              isReadOnly={isReadOnly}
              isEmptyStateHidden={isEmptyStateHidden}
            />
          )}
        </RecordTableWidgetProvider>
      )}
    </>
  );
};
