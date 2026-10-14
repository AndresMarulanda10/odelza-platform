import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useState } from 'react';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { IconCheck, type IconComponent } from 'twenty-ui/icon';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export type TimelineSettingsOption = {
  id: string;
  label: string;
  Icon?: IconComponent;
  searchTerms?: string[];
};

// Isolated metadata selection: choosing a timeline source must never create or
// remove view entities as the native record-table source menu does.
export const TimelineSettingsDropdown = ({
  options,
  value,
  onChange,
  searchPlaceholder,
  emptyLabel,
  clearLabel,
}: {
  options: TimelineSettingsOption[];
  value?: string | null;
  onChange: (value: string | null) => void;
  searchPlaceholder: string;
  emptyLabel: string;
  clearLabel: string;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );
  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );
  const { closeDropdown } = useCloseDropdown();
  const filtered = filterBySearchQuery({
    items: options,
    searchQuery,
    getSearchableValues: (option) => [
      option.label,
      ...(option.searchTerms ?? []),
    ],
  });
  const choose = (id: string | null) => {
    onChange(id);
    closeDropdown(dropdownId);
  };
  const choices: TimelineSettingsOption[] = [
    { id: 'timeline-clear', label: clearLabel },
    ...filtered,
  ];
  return (
    <>
      <DropdownMenuSearchInput
        autoFocus
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={choices.map((choice) => choice.id)}
        >
          {choices.map((choice) => (
            <SelectableListItem
              key={choice.id}
              itemId={choice.id}
              onEnter={() =>
                choose(choice.id === 'timeline-clear' ? null : choice.id)
              }
            >
              <MenuItemSelect
                text={choice.label}
                LeftIcon={choice.Icon ?? IconCheck}
                selected={
                  choice.id === 'timeline-clear'
                    ? value == null
                    : value === choice.id
                }
                focused={selectedItemId === choice.id}
                onClick={() =>
                  choose(choice.id === 'timeline-clear' ? null : choice.id)
                }
              />
            </SelectableListItem>
          ))}
        </SelectableList>
        {filtered.length === 0 && <div role="status">{emptyLabel}</div>}
      </DropdownMenuItemsContainer>
    </>
  );
};
