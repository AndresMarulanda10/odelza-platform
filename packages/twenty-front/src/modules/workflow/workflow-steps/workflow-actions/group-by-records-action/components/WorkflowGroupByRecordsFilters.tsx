import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { WorkflowFindRecordsFilters } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsFilters';
import { WorkflowFindRecordsFiltersEffect } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsFiltersEffect';
import { type FindRecordsActionFilter } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowEditActionFindRecords';

export const WorkflowGroupByRecordsFilters = ({
  object,
  actionId,
  readonly,
  filter,
  onChange,
}: {
  object: EnrichedObjectMetadataItem;
  actionId: string;
  readonly: boolean;
  filter?: FindRecordsActionFilter;
  onChange: (filter: FindRecordsActionFilter) => void;
}) => {
  const instanceId = `group-by-filters-${actionId}-${object.nameSingular}`;
  const derived = useRecordIndexFieldMetadataDerivedStates(object, instanceId);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  return (
    <RecordIndexContextProvider
      value={{
        indexIdentifierUrl: () => '',
        onIndexRecordsLoaded: () => {},
        objectNamePlural: object.namePlural,
        objectNameSingular: object.nameSingular,
        objectMetadataItem: object,
        recordIndexId: instanceId,
        viewBarInstanceId: instanceId,
        objectPermissionsByObjectMetadataId,
        ...derived,
      }}
    >
      <RecordFilterGroupsComponentInstanceContext.Provider
        value={{ instanceId }}
      >
        <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
          <WorkflowFindRecordsFilters
            objectMetadataItem={object}
            readonly={readonly}
            onChange={(next) => {
              if (!readonly) onChange(next);
            }}
          />
          <WorkflowFindRecordsFiltersEffect defaultValue={filter} />
        </RecordFiltersComponentInstanceContext.Provider>
      </RecordFilterGroupsComponentInstanceContext.Provider>
    </RecordIndexContextProvider>
  );
};
