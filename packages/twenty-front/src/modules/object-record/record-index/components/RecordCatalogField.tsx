import { styled } from '@linaria/react';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';

const StyledField = styled.div`
  min-width: 0;
  width: 100%;
`;

export const RecordCatalogField = ({
  recordId,
  recordIndexId,
  fieldDefinition,
  fieldMetadataItem,
}: {
  recordId: string;
  recordIndexId: string;
  fieldDefinition: FieldDefinition<FieldMetadata>;
  fieldMetadataItem: FieldMetadataItem;
}) => {
  const { objectMetadataItem, objectPermissionsByObjectMetadataId } =
    useRecordIndexContextOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();
  const junctionConfig = getJunctionConfig({
    settings: fieldMetadataItem.settings,
    relationObjectMetadataId:
      fieldMetadataItem.relation?.targetObjectMetadata.id ?? '',
    sourceObjectMetadataId: objectMetadataItem.id,
    objectMetadataItems,
  });
  const targetObjectMetadataIds = [
    ...getTargetObjectMetadataIdsFromField(fieldMetadataItem),
    ...(junctionConfig?.targetFields.flatMap(
      getTargetObjectMetadataIdsFromField,
    ) ?? []),
    ...(['noteTargets', 'taskTargets'].includes(fieldMetadataItem.name)
      ? objectMetadataItems
          .filter(
            (object) =>
              object.nameSingular ===
              (fieldMetadataItem.name === 'noteTargets' ? 'note' : 'task'),
          )
          .map((object) => object.id)
      : []),
  ];
  const isForbidden =
    !getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      objectMetadataItem.id,
    ).canReadObjectRecords ||
    !objectMetadataItem.readableFields.some(
      (field) => field.id === fieldMetadataItem.id,
    ) ||
    targetObjectMetadataIds.some((targetId) => {
      const targetObject = objectMetadataItems.find(
        (object) => object.id === targetId,
      );
      const isLabelReadable =
        !targetObject?.labelIdentifierFieldMetadataId ||
        targetObject.readableFields.some(
          (field) => field.id === targetObject.labelIdentifierFieldMetadataId,
        );
      return (
        !isLabelReadable ||
        !getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          targetId,
        ).canReadObjectRecords
      );
    });
  return (
    <StyledField onClick={(event) => event.stopPropagation()}>
      <FieldContext.Provider
        value={{
          recordId,
          fieldMetadataItemId: fieldMetadataItem.id,
          fieldDefinition,
          isLabelIdentifier: false,
          isRecordFieldReadOnly: true,
          isForbidden,
          disableChipClick: false,
          isDisplayModeFixHeight: false,
        }}
      >
        <RecordFieldComponentInstanceContext.Provider
          value={{
            instanceId: `catalog-${recordIndexId}-${recordId}-${fieldDefinition.fieldMetadataId}`,
          }}
        >
          <FieldDisplay />
        </RecordFieldComponentInstanceContext.Provider>
      </FieldContext.Provider>
    </StyledField>
  );
};
