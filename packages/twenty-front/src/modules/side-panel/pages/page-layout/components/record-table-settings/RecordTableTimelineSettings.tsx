import { useStore } from 'jotai';
import { t } from '@lingui/core/macro';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { TimelineColorDropdown } from '@/page-layout/widgets/task-timeline/components/TimelineColorDropdown';
import { getTimelineFields } from '@/page-layout/widgets/task-timeline/utils/timelineSource';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { TimelineSettingsDropdown } from '@/side-panel/pages/page-layout/components/dashboard/TimelineSettingsDropdown';
import { useViewById } from '@/views/hooks/useViewById';
import { useInitializeRecordTableWidgetViewDraft } from '@/page-layout/widgets/record-table/hooks/useInitializeRecordTableWidgetViewDraft';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { DEFAULT_TASK_TIMELINE_BAR_COLOR } from 'twenty-shared/constants';
import { type ViewTimelineConfiguration } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendar, IconColorSwatch } from 'twenty-ui/icon';

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
  const { view: savedView } = useViewById(viewId);
  // The panel can open before the canvas seeds its private-view draft.
  useInitializeRecordTableWidgetViewDraft({
    widgetId,
    pageLayoutId,
    allowEmptyFields: true,
    view:
      savedView?.id === viewId &&
      savedView.objectMetadataId === objectMetadataId &&
      savedView.isActive &&
      savedView.type === 'TABLE_WIDGET'
        ? savedView
        : undefined,
  });
  const recordTableWidgetViewDraft = useAtomComponentStateValue(
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
  const candidate = recordTableWidgetViewDraft[widgetId];
  const snapshot =
    candidate?.view.id === viewId &&
    candidate.view.objectMetadataId === objectMetadataId
      ? candidate
      : undefined;
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
          !isDefined(draft) ||
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
      {!canConfigure && (
        <div role="status">{t`Timeline settings are unavailable. Reopen the widget in dashboard edit mode and check access to its source.`}</div>
      )}
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
          <CommandMenuItemDropdown
            id={itemId}
            dropdownId={`${widgetId}-${key}`}
            label={label}
            Icon={IconCalendar}
            disabled={!canConfigure}
            description={
              configuration?.[key]
                ? (fields.find(
                    (field) => field.universalIdentifier === configuration[key],
                  )?.label ?? t`Unavailable field`)
                : t`Not configured`
            }
            contextualTextPosition="right"
            dropdownPlacement="bottom-end"
            dropdownComponents={
              <DropdownContent>
                <TimelineSettingsDropdown
                  options={fields.map((field) => ({
                    id: field.universalIdentifier,
                    label: field.label,
                    searchTerms: [field.name],
                    Icon: IconCalendar,
                  }))}
                  value={configuration?.[key]}
                  searchPlaceholder={t`Search fields`}
                  emptyLabel={t`No readable date fields available for this source.`}
                  clearLabel={t`Not configured`}
                  onChange={(value) => update({ [key]: value })}
                />
              </DropdownContent>
            }
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
