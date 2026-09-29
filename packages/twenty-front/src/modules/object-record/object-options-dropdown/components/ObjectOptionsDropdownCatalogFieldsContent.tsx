import { useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';

import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';

type CatalogFieldTarget = 'image' | 'subtitle' | 'detail';

const CATALOG_FIELD_TARGETS: CatalogFieldTarget[] = [
  'image',
  'subtitle',
  'detail',
];

export const ObjectOptionsDropdownCatalogFieldsContent = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { objectMetadataItem, resetContent, closeDropdown } =
    useObjectOptionsDropdown();
  const { currentView } = useGetCurrentViewOnly();
  const { updateCurrentView } = useUpdateCurrentView();

  const [selectedTarget, setSelectedTarget] =
    useState<CatalogFieldTarget | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const currentFieldIds: Record<CatalogFieldTarget, string | null | undefined> =
    {
      image: currentView?.catalogImageFieldMetadataId,
      subtitle: currentView?.catalogSubtitleFieldMetadataId,
      detail: currentView?.catalogDetailFieldMetadataId,
    };

  const targetLabels: Record<CatalogFieldTarget, string> = {
    image: t`Image`,
    subtitle: t`Subtitle`,
    detail: t`Extra field`,
  };

  const getFieldLabel = (fieldMetadataId?: string | null) =>
    isDefined(fieldMetadataId)
      ? objectMetadataItem.fields.find((field) => field.id === fieldMetadataId)
          ?.label
      : undefined;

  const handleFieldChange = async (
    target: CatalogFieldTarget,
    fieldMetadataId: string | null,
  ) => {
    if (target === 'image') {
      await updateCurrentView({
        catalogImageFieldMetadataId: fieldMetadataId,
      });
    }

    if (target === 'subtitle') {
      await updateCurrentView({
        catalogSubtitleFieldMetadataId: fieldMetadataId,
      });
    }

    if (target === 'detail') {
      await updateCurrentView({
        catalogDetailFieldMetadataId: fieldMetadataId,
      });
    }

    closeDropdown();
  };

  if (isDefined(selectedTarget)) {
    const filteredFields = objectMetadataItem.fields.filter((field) =>
      field.label.toLowerCase().includes(searchInput.toLowerCase()),
    );

    return (
      <DropdownContent>
        <DropdownMenuHeader
          StartComponent={
            <DropdownMenuHeaderLeftComponent
              onClick={() => {
                setSearchInput('');
                setSelectedTarget(null);
              }}
              Icon={IconChevronLeft}
            />
          }
        >
          {targetLabels[selectedTarget]}
        </DropdownMenuHeader>
        <DropdownMenuSearchInput
          autoFocus
          value={searchInput}
          placeholder={t`Search fields`}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer>
          <MenuItemSelect
            selected={!isDefined(currentFieldIds[selectedTarget])}
            onClick={() => handleFieldChange(selectedTarget, null)}
            text={t`Automatic`}
          />
          {filteredFields.map((fieldMetadataItem) => (
            <MenuItemSelect
              key={fieldMetadataItem.id}
              selected={
                fieldMetadataItem.id === currentFieldIds[selectedTarget]
              }
              onClick={() =>
                handleFieldChange(selectedTarget, fieldMetadataItem.id)
              }
              LeftIcon={getIcon(fieldMetadataItem.icon)}
              text={fieldMetadataItem.label}
            />
          ))}
        </DropdownMenuItemsContainer>
      </DropdownContent>
    );
  }

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={resetContent}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Catalog fields`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer scrollable={false}>
        {CATALOG_FIELD_TARGETS.map((target) => (
          <MenuItemSelect
            key={target}
            selected={false}
            onClick={() => setSelectedTarget(target)}
            text={targetLabels[target]}
            contextualText={
              getFieldLabel(currentFieldIds[target]) ?? t`Automatic`
            }
            contextualTextPosition="right"
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
