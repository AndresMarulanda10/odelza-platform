import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { viewsByObjectMetadataIdFamilySelector } from '@/views/states/selectors/viewsByObjectMetadataIdFamilySelector';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItemSelect } from 'twenty-ui/navigation';
import {
  ViewType,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export const ViewWidgetViewDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);
  const { closeDropdown } = useCloseDropdown();
  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );
  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );
  const objectMetadataId = widgetInEditMode?.objectMetadataId ?? '';
  const views = useAtomFamilySelectorValue(
    viewsByObjectMetadataIdFamilySelector,
    objectMetadataId,
  );
  const kanbanViews = views.filter(
    (view) => view.isActive && view.type === ViewType.KANBAN,
  );
  const selectedViewId =
    widgetInEditMode?.configuration.configurationType ===
      WidgetConfigurationType.VIEW &&
    'viewId' in widgetInEditMode.configuration &&
    typeof widgetInEditMode.configuration.viewId === 'string'
      ? widgetInEditMode.configuration.viewId
      : undefined;
  const filteredViews = filterBySearchQuery({
    items: kanbanViews,
    searchQuery,
    getSearchableValues: (view) => [view.name],
  });

  const handleSelectView = (viewId: string) => {
    const selectedView = kanbanViews.find((view) => view.id === viewId);

    if (!isDefined(selectedView) || !isDefined(widgetInEditMode)) {
      return;
    }

    updateCurrentWidgetConfig({ configToUpdate: { viewId } });
    updatePageLayoutWidget(widgetInEditMode.id, { title: selectedView.name });
    closeDropdown();
  };

  return (
    <>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search Kanban views`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={filteredViews.map((view) => view.id)}
        >
          {filteredViews.map((view) => (
            <SelectableListItem
              key={view.id}
              itemId={view.id}
              onEnter={() => handleSelectView(view.id)}
            >
              <MenuItemSelect
                text={view.name}
                selected={selectedViewId === view.id}
                focused={selectedItemId === view.id}
                onClick={() => handleSelectView(view.id)}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
