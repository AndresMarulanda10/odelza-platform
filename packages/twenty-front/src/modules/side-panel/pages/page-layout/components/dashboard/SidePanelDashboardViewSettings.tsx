import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { ViewWidgetDataSourceDropdownContent } from '@/side-panel/pages/page-layout/components/view-settings/ViewWidgetDataSourceDropdownContent';
import { ViewWidgetViewDropdownContent } from '@/side-panel/pages/page-layout/components/view-settings/ViewWidgetViewDropdownContent';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconBox, IconLayoutKanban } from 'twenty-ui/icon';
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

export const SidePanelDashboardViewSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const configuration = widgetInEditMode.configuration;
  const viewId =
    configuration.configurationType === WidgetConfigurationType.VIEW &&
    'viewId' in configuration &&
    typeof configuration.viewId === 'string'
      ? configuration.viewId
      : undefined;

  return (
    <StyledContainer>
      <StyledSettingsContainer>
        <SidePanelList selectableItemIds={['view-source', 'view-selection']}>
          <SidePanelGroup heading={t`Settings`}>
            <SelectableListItem itemId="view-source">
              <CommandMenuItemDropdown
                Icon={IconBox}
                label={t`Source`}
                id="view-source"
                dropdownId="view-source"
                dropdownComponents={
                  <DropdownContent>
                    <ViewWidgetDataSourceDropdownContent />
                  </DropdownContent>
                }
                dropdownPlacement="bottom-end"
                hasSubMenu
                description={
                  isDefined(widgetInEditMode.objectMetadataId)
                    ? t`Object selected`
                    : t`Select an object`
                }
                contextualTextPosition="right"
              />
            </SelectableListItem>
            <SelectableListItem itemId="view-selection">
              <CommandMenuItemDropdown
                Icon={IconLayoutKanban}
                label={t`View`}
                id="view-selection"
                dropdownId="view-selection"
                dropdownComponents={
                  <DropdownContent>
                    <ViewWidgetViewDropdownContent />
                  </DropdownContent>
                }
                dropdownPlacement="bottom-end"
                hasSubMenu
                description={
                  isDefined(viewId) && viewId !== ''
                    ? t`Kanban view selected`
                    : t`Select a Kanban view`
                }
                contextualTextPosition="right"
              />
            </SelectableListItem>
          </SidePanelGroup>
        </SidePanelList>
      </StyledSettingsContainer>
      <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
    </StyledContainer>
  );
};
