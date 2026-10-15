import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { getOverdueTaskPresetObject } from '@/page-layout/widgets/record-table/utils/buildOverdueTaskRecordTableWidgetPreset';

// Resolve asynchronous metadata before entering the ordinary provider's strict lookup.
export const OverdueAttentionWidget = (props: {
  objectMetadataId: string;
  viewId: string;
  widgetId: string;
  recordLimit?: number;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const object = objectMetadataItems.find(
    (item) => item.id === props.objectMetadataId,
  );
  const permission =
    objectPermissionsByObjectMetadataId[props.objectMetadataId];
  if (!object || permission === undefined)
    return <div role="status">Loading overdue tasks…</div>;
  if (!permission.canReadObjectRecords)
    return (
      <div role="status">
        Overdue tasks are not available with your permissions.
      </div>
    );
  if (
    !getOverdueTaskPresetObject([object], objectPermissionsByObjectMetadataId)
  ) {
    return <div role="status">The overdue task source is unavailable.</div>;
  }
  return (
    <RecordTableWidgetRendererContent
      objectMetadataId={props.objectMetadataId}
      viewId={props.viewId}
      widgetId={props.widgetId}
      recordLimit={props.recordLimit}
      presentationMode="OVERDUE_ATTENTION"
    />
  );
};
