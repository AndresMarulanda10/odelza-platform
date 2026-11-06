import { styled } from '@linaria/react';
import { useContext } from 'react';
import { AvatarOrIcon } from 'twenty-ui/data-display';
import { IconX } from 'twenty-ui/icon';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

import { getFileType } from '@/activities/files/utils/getFileType';
import { useFileCategoryColors } from '@/file/hooks/useFileCategoryColors';
import { IconMapping } from '@/file/utils/fileIconMappings';

type AttachmentChipProps = {
  file: { id: string; name: string };
  onRemove: () => void;
  readonly?: boolean;
};

const StyledChip = styled.div<{ deletable: boolean }>`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.transparent.light};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  column-gap: ${odelzaThemeCssVariables.spacing[1]};
  display: inline-flex;
  flex-direction: row;
  flex-shrink: 0;
  max-width: 140px;
  padding-left: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledLabel = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDelete = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-bottom-right-radius: ${odelzaThemeCssVariables.border.radius.sm};
  border-top-right-radius: ${odelzaThemeCssVariables.border.radius.sm};
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  height: 20px;
  justify-content: center;
  margin: 0;
  padding: 0;
  user-select: none;
  width: 20px;

  &:hover {
    background-color: ${odelzaThemeCssVariables.background.transparent.medium};
    color: ${odelzaThemeCssVariables.font.color.primary};
  }
`;

export const AttachmentChip = ({
  file,
  onRemove,
  readonly = false,
}: AttachmentChipProps) => {
  const { theme } = useContext(ThemeContext);
  const iconColors = useFileCategoryColors();

  const handleChipClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleRemoveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onRemove();
  };

  return (
    <StyledChip deletable={!readonly} onClick={handleChipClick}>
      <AvatarOrIcon
        Icon={IconMapping[getFileType(file.name)]}
        IconBackgroundColor={iconColors[getFileType(file.name)]}
      />
      <StyledLabel title={file.name}>{file.name}</StyledLabel>

      {!readonly && (
        <StyledDelete onClick={handleRemoveClick}>
          <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        </StyledDelete>
      )}
    </StyledChip>
  );
};
