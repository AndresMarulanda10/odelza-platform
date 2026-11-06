import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconX } from 'twenty-ui/icon';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledBackButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: ${odelzaThemeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-family: ${odelzaThemeCssVariables.font.family};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding-bottom: ${odelzaThemeCssVariables.spacing[1]};
  padding-left: ${odelzaThemeCssVariables.spacing[1]};
  padding-right: ${odelzaThemeCssVariables.spacing[0.5]};
  padding-top: ${odelzaThemeCssVariables.spacing[1]};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${odelzaThemeCssVariables.background.transparent.light};
    border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  }
`;

type NavigationMenuItemBackButtonProps = {
  folderName: string;
};

export const NavigationMenuItemBackButton = ({
  folderName,
}: NavigationMenuItemBackButtonProps) => {
  const { theme } = useContext(ThemeContext);
  const setCurrentNavigationMenuItemFolderId = useSetAtomState(
    currentNavigationMenuItemFolderIdState,
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentNavigationMenuItemFolderId(null);
  };

  return (
    <StyledBackButton onClick={handleClick}>
      <IconX
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.lg}
        color={theme.font.color.tertiary}
      />
      <span>{folderName}</span>
    </StyledBackButton>
  );
};
