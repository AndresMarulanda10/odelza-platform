import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { lastLoadedRecordTableWidgetViewIdComponentState } from '@/object-record/record-table-widget/states/lastLoadedRecordTableWidgetViewIdComponentState';
import { OverdueAttentionList } from '@/page-layout/widgets/record-table/components/OverdueAttentionList';
import { getOverdueTaskPresetObject } from '@/page-layout/widgets/record-table/utils/buildOverdueTaskRecordTableWidgetPreset';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const OverdueAttentionViewGate = ({ viewId }: { viewId: string }) => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const loaded = useAtomComponentStateValue(
    lastLoadedRecordTableWidgetViewIdComponentState,
  );
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  if (
    !getOverdueTaskPresetObject(
      [objectMetadataItem],
      objectPermissionsByObjectMetadataId,
    )
  ) {
    return <div role="status">The overdue task source is unavailable.</div>;
  }
  if (
    loaded?.viewId !== viewId ||
    loaded.objectMetadataItemUpdatedAt !== objectMetadataItem.updatedAt
  ) {
    return <div role="status">Loading overdue tasks…</div>;
  }
  const assigneeField = objectMetadataItem.readableFields.find(
    (field) => field.name === 'assignee',
  );
  const target = objectMetadataItems.find(
    (item) => item.id === assigneeField?.relation?.targetObjectMetadata.id,
  );
  // The shared depth-one field selector needs relation metadata even when its values are denied.
  if (!target) return <div role="status">Loading task details…</div>;
  const permission = objectPermissionsByObjectMetadataId[target.id];
  const allowedIdentifierFields = target.readableFields.filter(
    (field) =>
      field.isActive &&
      permission?.restrictedFields?.[field.id]?.canRead !== false &&
      (field.id === target.labelIdentifierFieldMetadataId ||
        field.id === target.imageIdentifierFieldMetadataId),
  );
  const canReadLabel =
    permission?.canReadObjectRecords === true &&
    allowedIdentifierFields.some(
      (field) => field.id === target.labelIdentifierFieldMetadataId,
    );
  const fields = canReadLabel
    ? Object.fromEntries([
        ['id', true],
        ...allowedIdentifierFields.map((field) => [field.name, true]),
      ])
    : undefined;
  return (
    <OverdueAttentionList
      key={JSON.stringify([
        viewId,
        fields,
        objectPermissionsByObjectMetadataId,
      ])}
      assigneeObjectName={canReadLabel ? target.nameSingular : undefined}
      assigneeFields={fields}
      isAssigneeImageHidden={
        !allowedIdentifierFields.some(
          (field) => field.id === target.imageIdentifierFieldMetadataId,
        )
      }
    />
  );
};
