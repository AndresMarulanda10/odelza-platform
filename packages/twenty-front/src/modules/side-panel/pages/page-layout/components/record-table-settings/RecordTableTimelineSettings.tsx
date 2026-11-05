import { useStore } from 'jotai';
import { t } from '@lingui/core/macro';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { TimelineColorDropdown } from '@/page-layout/widgets/task-timeline/components/TimelineColorDropdown';
import { getTimelineFields } from '@/page-layout/widgets/task-timeline/utils/timelineSource';
import { Select } from '@/ui/input/components/Select';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { DEFAULT_TASK_TIMELINE_BAR_COLOR } from 'twenty-shared/constants';
import { type ViewTimelineConfiguration } from 'twenty-shared/types';
import { IconColorSwatch } from 'twenty-ui/icon';

// Changes remain in this widget's draft until the existing dashboard Save/Cancel flow.
export const RecordTableTimelineSettings = ({
  pageLayoutId,
  widgetId,
  viewId,
  objectMetadataId,
}: {
  pageLayoutId: string;
  widgetId: string;
  viewId: string;
  objectMetadataId: string;
}) => {
  const store = useStore();
  const drafts = useAtomComponentStateValue(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const permissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataId,
  );
  const snapshot = drafts[widgetId];
  const canConfigure = Boolean(
    snapshot &&
    snapshot.view.id === viewId &&
    snapshot.view.objectMetadataId === objectMetadataId &&
    objectMetadataItem.isActive &&
    permissions?.canReadObjectRecords,
  );
  const fields = permissions?.canReadObjectRecords
    ? getTimelineFields(objectMetadataItem, permissions, 'date')
    : [];
  const configuration = snapshot?.view.timelineConfiguration;
  const update = (patch: Partial<ViewTimelineConfiguration>) => {
    if (!canConfigure) return;
    store.set(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: pageLayoutId,
      }),
      (current) => {
        const draft = current[widgetId];
        if (
          !draft ||
          draft.view.id !== viewId ||
          draft.view.objectMetadataId !== objectMetadataId
        )
          return current;
        return {
          ...current,
          [widgetId]: {
            ...draft,
            view: {
              ...draft.view,
              timelineConfiguration: {
                ...draft.view.timelineConfiguration,
                ...patch,
              },
            },
          },
        };
      },
    );
  };
  return (
    <>
      {(
        [
          [
            'startDateFieldMetadataUniversalIdentifier',
            t`Start date`,
            'record-table-timeline-start',
          ],
          [
            'endDateFieldMetadataUniversalIdentifier',
            t`End date`,
            'record-table-timeline-end',
          ],
        ] as const
      ).map(([key, label, itemId]) => (
        <SelectableListItem key={key} itemId={itemId}>
          <Select
            dropdownId={`${widgetId}-${key}`}
            label={label}
            disabled={!canConfigure}
            value={configuration?.[key] ?? ''}
            options={fields.map((field) => ({
              value: field.universalIdentifier,
              label: field.label,
            }))}
            emptyOption={{ value: '', label: t`Not configured` }}
            withSearchInput
            onChange={(value) => update({ [key]: value || null })}
          />
        </SelectableListItem>
      ))}
      <SelectableListItem itemId="record-table-timeline-color">
        <CommandMenuItemDropdown
          id="record-table-timeline-color"
          dropdownId={`${widgetId}-timeline-color`}
          label={t`Bar color`}
          Icon={IconColorSwatch}
          disabled={!canConfigure}
          dropdownComponents={
            <TimelineColorDropdown
              value={configuration?.barColor ?? DEFAULT_TASK_TIMELINE_BAR_COLOR}
              onChange={(barColor) => update({ barColor })}
            />
          }
          dropdownPlacement="bottom-end"
        />
      </SelectableListItem>
    </>
  );
};
