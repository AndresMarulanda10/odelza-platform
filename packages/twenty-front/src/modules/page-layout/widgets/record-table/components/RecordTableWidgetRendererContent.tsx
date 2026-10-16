import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { RecordTableWidget } from '@/object-record/record-table-widget/components/RecordTableWidget';
import { RecordTableWidgetProvider } from '@/object-record/record-table-widget/components/RecordTableWidgetProvider';
import { RecordTableWidgetViewDraftInitEffect } from '@/page-layout/widgets/record-table/components/RecordTableWidgetViewDraftInitEffect';
import { OverdueAttentionViewGate } from '@/page-layout/widgets/record-table/components/OverdueAttentionViewGate';

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
    </>
  );
};
