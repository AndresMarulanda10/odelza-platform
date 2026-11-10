import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { CommandMenuItemNumberInput } from '@/command-menu/components/CommandMenuItemNumberInput';
import { useRecordTableWidgetFieldCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetFieldCallbacks';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { RecordTableDataSourceDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableDataSourceDropdownContent';
import { RecordTableFieldsDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableFieldsDropdownContent';
import { RecordTableTimelineSettings } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableTimelineSettings';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useRecordTableSettingsDescriptions } from '@/side-panel/pages/page-layout/hooks/useRecordTableSettingsDescriptions';
import { SidePanelDashboardViewSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardViewSettings';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowBarToDownDashed,
  IconArrowsSort,
  IconBox,
  IconFilter,
  IconListDetails,
  IconTable,
  IconClock,
  IconTimelineEvent,
} from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const RecordTableLayoutOptions = ({
  mode,
  onChange,
}: {
  mode: string | null | undefined;
  onChange: (mode: 'TABLE' | 'TIMELINE') => void;
}) => {
  const { closeDropdown } = useCloseDropdown();
  const select = (value: 'TABLE' | 'TIMELINE') => {
    onChange(value);
    closeDropdown();
  };
  return (
    <DropdownContent>
      <SelectableList
        selectableListInstanceId="record-table-layout"
        focusId="record-table-layout"
        selectableItemIdArray={['TABLE', 'TIMELINE']}
      >
        {(['TABLE', 'TIMELINE'] as const).map((value) => (
          <SelectableListItem
            key={value}
            itemId={value}
            onEnter={() => select(value)}
          >
            <MenuItemSelect
              text={value === 'TABLE' ? t`Table` : t`Timeline`}
              LeftIcon={value === 'TABLE' ? IconTable : IconTimelineEvent}
              selected={value === (mode === 'TIMELINE' ? 'TIMELINE' : 'TABLE')}
              onClick={() => select(value)}
            />
          </SelectableListItem>
        ))}
      </SelectableList>
    </DropdownContent>
  );
};

export const SidePanelDashboardRecordTableSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (
    widgetInEditMode?.configuration.configurationType ===
    WidgetConfigurationType.VIEW
  ) {
    return <SidePanelDashboardViewSettings />;
  }

  return <SidePanelDashboardRecordTableSettingsContent />;
};

const SidePanelDashboardRecordTableSettingsContent = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  const configuration = widgetInEditMode?.configuration;
  const isRecordTableConfiguration =
    configuration?.configurationType === WidgetConfigurationType.RECORD_TABLE;
  const isOverdue =
    isRecordTableConfiguration &&
    'presentationMode' in configuration &&
    configuration.presentationMode === 'OVERDUE_ATTENTION';
  const mode =
    isRecordTableConfiguration && 'presentationMode' in configuration
      ? configuration.presentationMode
      : undefined;
  const isTimeline = mode === 'TIMELINE';

  const viewId =
    isRecordTableConfiguration &&
    isDefined(configuration) &&
    'viewId' in configuration &&
    isDefined(configuration.viewId)
      ? (configuration.viewId as string)
      : null;

  const limit =
    isRecordTableConfiguration &&
    isDefined(configuration) &&
    'recordLimit' in configuration &&
    isDefined(configuration.recordLimit)
      ? (configuration.recordLimit as number)
      : undefined;

  const {
    sourceDescription,
    fieldsDescription,
    filterDescription,
    sortDescription,
  } = useRecordTableSettingsDescriptions({
    objectMetadataId: widgetInEditMode?.objectMetadataId,
    viewId,
  });

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const handleLimitChange = (value: number | null) => {
    const nextLimit =
      !isDefined(value) || value < 1 ? undefined : Math.floor(value);

    updateCurrentWidgetConfig({
      configToUpdate: { recordLimit: nextLimit },
    });
  };

  const { handleFieldUpdated, handleFieldCreated } =
    useRecordTableWidgetFieldCallbacks({
      pageLayoutId,
      widgetId: widgetInEditMode?.id ?? '',
      viewId: viewId ?? '',
    });

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const hasViewId = isDefined(viewId);

  const selectableItemIds = [
    ...(!isOverdue ? ['object-view-layout'] : []),
    'record-table-source',
    ...(hasViewId
      ? [
          ...(isTimeline
            ? [
                'record-table-timeline-start',
                'record-table-timeline-end',
                'record-table-timeline-color',
              ]
            : []),
          'record-table-fields',
          'record-table-filter',
          'record-table-sort',
          'record-table-limit',
        ]
      : []),
  ];

  const handleFilterClick = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutRecordTableFilter);
  };

  const handleSortClick = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutRecordTableSort);
  };

  return (
    <StyledContainer>
      <WidgetComponentInstanceContext.Provider
        value={{ instanceId: widgetInEditMode.id }}
      >
        <StyledSettingsContainer>
          <SidePanelList selectableItemIds={selectableItemIds}>
            <SidePanelGroup heading={t`Settings`}>
              <SelectableListItem itemId="object-view-layout">
                <CommandMenuItemDropdown
                  Icon={
                    isOverdue
                      ? IconClock
                      : isTimeline
                        ? IconTimelineEvent
                        : IconTable
                  }
                  label={t`Layout`}
                  id="object-view-layout"
                  dropdownId="object-view-layout"
                  dropdownComponents={
                    isOverdue ? (
                      <></>
                    ) : (
                      <RecordTableLayoutOptions
                        mode={mode}
                        onChange={(presentationMode) =>
                          updateCurrentWidgetConfig({
                            configToUpdate: { presentationMode },
                          })
                        }
                      />
                    )
                  }
                  dropdownPlacement="bottom-end"
                  description={
                    isOverdue
                      ? t`Overdue tasks`
                      : isTimeline
                        ? t`Timeline`
                        : t`Table`
                  }
                  disabled={!isRecordTableConfiguration || isOverdue}
                  contextualTextPosition="right"
                />
              </SelectableListItem>
              <SelectableListItem itemId="record-table-source">
                <CommandMenuItemDropdown
                  Icon={IconBox}
                  label={t`Source`}
                  id="record-table-source"
                  dropdownId="record-table-source"
                  dropdownComponents={
                    <DropdownContent>
                      <RecordTableDataSourceDropdownContent />
                    </DropdownContent>
                  }
                  dropdownPlacement="bottom-end"
                  hasSubMenu
                  description={sourceDescription}
                  contextualTextPosition="right"
                />
              </SelectableListItem>
              {hasViewId && (
                <>
                  {isTimeline && widgetInEditMode.objectMetadataId && (
                    <RecordTableTimelineSettings
                      pageLayoutId={pageLayoutId}
                      widgetId={widgetInEditMode.id}
                      viewId={viewId!}
                      objectMetadataId={widgetInEditMode.objectMetadataId}
                    />
                  )}
                  <SelectableListItem itemId="record-table-fields">
                    <CommandMenuItemDropdown
                      Icon={IconListDetails}
                      label={t`Fields`}
                      id="record-table-fields"
                      dropdownId="record-table-fields"
                      dropdownComponents={
                        <RecordTableFieldsDropdownContent
                          viewId={viewId}
                          objectMetadataId={widgetInEditMode.objectMetadataId!}
                          onFieldUpdated={handleFieldUpdated}
                          onFieldCreated={handleFieldCreated}
                        />
                      }
                      dropdownPlacement="bottom-end"
                      hasSubMenu
                      description={fieldsDescription}
                      contextualTextPosition="right"
                    />
                  </SelectableListItem>
                  <SelectableListItem
                    itemId="record-table-filter"
                    onEnter={handleFilterClick}
                  >
                    <CommandMenuItem
                      id="record-table-filter"
                      label={t`Filter`}
                      Icon={IconFilter}
                      hasSubMenu
                      onClick={handleFilterClick}
                      description={filterDescription}
                      contextualTextPosition="right"
                    />
                  </SelectableListItem>
                  <SelectableListItem
                    itemId="record-table-sort"
                    onEnter={handleSortClick}
                  >
                    <CommandMenuItem
                      id="record-table-sort"
                      label={t`Sort`}
                      Icon={IconArrowsSort}
                      hasSubMenu
                      onClick={handleSortClick}
                      description={sortDescription}
                      contextualTextPosition="right"
                    />
                  </SelectableListItem>
                  <SelectableListItem itemId="record-table-limit">
                    <CommandMenuItemNumberInput
                      id="record-table-limit"
                      label={t`Limit`}
                      Icon={IconArrowBarToDownDashed}
                      value={isDefined(limit) ? `${limit}` : ''}
                      onChange={handleLimitChange}
                      placeholder={t`No limit`}
                    />
                  </SelectableListItem>
                </>
              )}
            </SidePanelGroup>
          </SidePanelList>
        </StyledSettingsContainer>
        <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
      </WidgetComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
