import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconPlus } from 'twenty-ui/icon';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledNewButton = styled.button`
  align-items: center;
  align-self: baseline;
  background-color: ${odelzaThemeCssVariables.background.primary};
  border: none;
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  padding: ${odelzaThemeCssVariables.spacing[1]};

  &:hover {
    background-color: ${odelzaThemeCssVariables.background.tertiary};
  }
`;

export const RecordBoardColumnNewRecordButton = () => {
  const { theme } = useContext(ThemeContext);
  const { objectMetadataItem, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const { columnDefinition } = useContext(RecordBoardColumnContext);

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem: objectMetadataItem,
  });

  if (
    !canCreateRecordsForObjectMetadataItem({
      objectPermissions,
      objectMetadataItem,
    })
  ) {
    return null;
  }

  if (hasAnySoftDeleteFilterOnView) {
    return null;
  }

  return (
    <StyledNewButton
      onClick={async () => {
        await createNewIndexRecord({
          position: 'last',
          [getFieldMetadataItemGqlFieldName(selectFieldMetadataItem)]:
            columnDefinition.value,
        });
      }}
    >
      <IconPlus size={theme.icon.size.md} />
      {t`New`}
    </StyledNewButton>
  );
};
