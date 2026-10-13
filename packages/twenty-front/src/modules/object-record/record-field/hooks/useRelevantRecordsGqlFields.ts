import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getImageIdentifierFieldMetadataItem } from '@/object-metadata/utils/getImageIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { hasObjectMetadataItemPositionField } from '@/object-metadata/utils/hasObjectMetadataItemPositionField';
import { generateActivityTargetGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateActivityTargetGqlFields';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { ViewType } from '@/views/types/ViewType';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';

import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';

import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { filterDuplicatesById, isDefined } from 'twenty-shared/utils';

type UseRecordsUsefulGqlFields = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  additionalFieldMetadataId?: string | null;
};

export const useRelevantRecordsGqlFields = ({
  objectMetadataItem,
  additionalFieldMetadataId,
}: UseRecordsUsefulGqlFields) => {
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const {
    fieldMetadataItemByFieldMetadataItemId,
    objectPermissionsByObjectMetadataId,
  } = useRecordIndexContextOrThrow();

  const { objectMetadataItems } = useObjectMetadataItems();
  const { currentView } = useGetCurrentViewOnly();
  const { canPersistChanges } = useCanPersistViewChanges();
  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
  );
  // Match the Catalog's no-row read-only compatibility boundary. Never widen
  // an explicit Fields selection, including a selection containing hidden rows.
  const legacyIds =
    !canPersistChanges &&
    currentView?.type === ViewType.CATALOG &&
    currentView.viewFields.length === 0 &&
    currentRecordFields.length === 0
      ? [
          currentView.catalogImageFieldMetadataId,
          currentView.catalogSubtitleFieldMetadataId,
          currentView.catalogDetailFieldMetadataId,
        ]
      : [];
  const legacyFields = objectMetadataItem.readableFields.filter(
    (field) =>
      getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        objectMetadataItem.id,
      ).canReadObjectRecords &&
      legacyIds.includes(field.id) &&
      (() => {
        const junctionConfig = getJunctionConfig({
          settings: field.settings,
          relationObjectMetadataId:
            field.relation?.targetObjectMetadata.id ?? '',
          sourceObjectMetadataId: objectMetadataItem.id,
          objectMetadataItems,
        });
        const targetIds = [
          ...getTargetObjectMetadataIdsFromField(field),
          ...(junctionConfig?.targetFields.flatMap(
            getTargetObjectMetadataIdsFromField,
          ) ?? []),
        ];
        return targetIds.every((targetId) => {
          const target = objectMetadataItems.find(
            (item) => item.id === targetId,
          );
          return (
            isDefined(target) &&
            getObjectPermissionsForObject(
              objectPermissionsByObjectMetadataId,
              targetId,
            ).canReadObjectRecords &&
            (!target.labelIdentifierFieldMetadataId ||
              target.readableFields.some(
                (item) => item.id === target.labelIdentifierFieldMetadataId,
              ))
          );
        });
      })() &&
      objectMetadataItem.fields.some(
        (objectField) => objectField.id === field.id,
      ) &&
      isActiveFieldMetadataItem({
        objectNameSingular: objectMetadataItem.nameSingular,
        fieldMetadata: field,
      }),
  );

  const visibleRecordFieldMetadataItems = visibleRecordFields
    .map(
      (field) =>
        fieldMetadataItemByFieldMetadataItemId[field.fieldMetadataItemId],
    )
    .filter(isDefined);

  const recordFilterFields = currentRecordFilters
    .map((recordFilter) =>
      objectMetadataItem.fields.find(
        (field) => field.id === recordFilter.fieldMetadataId,
      ),
    )
    .filter(isDefined);

  const additionalFieldMetadataItem = isDefined(additionalFieldMetadataId)
    ? fieldMetadataItemByFieldMetadataItemId[additionalFieldMetadataId]
    : undefined;

  const fieldMetadataItemsToUse = [
    ...legacyFields,
    ...visibleRecordFieldMetadataItems,
    ...(recordFilterFields ?? []),
    ...(isDefined(additionalFieldMetadataItem)
      ? [additionalFieldMetadataItem]
      : []),
  ].filter(filterDuplicatesById);

  const allDepthOneGqlFields = generateDepthRecordGqlFieldsFromFields({
    objectMetadataItems,
    fields: fieldMetadataItemsToUse,
    depth: 1,
  });

  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);
  const imageIdentifierFieldMetadataItem =
    getImageIdentifierFieldMetadataItem(objectMetadataItem);

  const hasPosition = hasObjectMetadataItemPositionField(objectMetadataItem);

  const isObjectAnActivity =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Note ||
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Task;

  return {
    id: true,
    ...(isDefined(labelIdentifierFieldMetadataItem)
      ? { [labelIdentifierFieldMetadataItem.name]: true }
      : {}),
    ...(isDefined(imageIdentifierFieldMetadataItem)
      ? { [imageIdentifierFieldMetadataItem.name]: true }
      : {}),
    ...(hasPosition ? { position: true } : {}),
    ...allDepthOneGqlFields,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    noteTargets: generateActivityTargetGqlFields({
      activityObjectNameSingular: CoreObjectNameSingular.Note,
      objectMetadataItems,
      loadRelations: isObjectAnActivity ? 'relations' : 'activity',
    }),
    taskTargets: generateActivityTargetGqlFields({
      activityObjectNameSingular: CoreObjectNameSingular.Task,
      objectMetadataItems,
      loadRelations: isObjectAnActivity ? 'relations' : 'activity',
    }),
  };
};
