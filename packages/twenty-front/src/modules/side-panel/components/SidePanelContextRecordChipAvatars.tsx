import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { Avatar } from 'twenty-ui/data-display';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';
const StyledIconWrapper = styled.div<{ withIconBackground?: boolean }>`
  align-items: center;
  background: ${({ withIconBackground }) =>
    withIconBackground ? odelzaThemeCssVariables.background.primary : 'unset'};
  border: 1px solid
    ${({ withIconBackground }) =>
      withIconBackground
        ? odelzaThemeCssVariables.border.color.medium
        : 'transparent'};
  &:not(:first-of-type) {
    margin-left: -${odelzaThemeCssVariables.spacing[1]};
  }
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  display: flex;
  justify-content: center;
`;

export const SidePanelContextRecordChipAvatars = ({
  objectMetadataItem,
  record,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  record: ObjectRecord;
}) => {
  const { theme } = useContext(ThemeContext);
  const { recordChipData } = useRecordChipData({
    objectNameSingular: objectMetadataItem.nameSingular,
    record,
  });
  const { Icon, IconColor } = useGetStandardObjectIcon(
    objectMetadataItem.nameSingular,
  );
  return (
    <StyledIconWrapper
      withIconBackground={recordChipData.avatarType !== 'rounded'}
    >
      {Icon ? (
        <Icon color={IconColor} size={theme.icon.size.sm} />
      ) : (
        <Avatar
          avatarUrl={getAbsoluteImageUrl(recordChipData.avatarUrl)}
          placeholderColorSeed={recordChipData.recordId}
          placeholder={recordChipData.name}
          type={recordChipData.avatarType}
          size="sm"
        />
      )}
    </StyledIconWrapper>
  );
};
