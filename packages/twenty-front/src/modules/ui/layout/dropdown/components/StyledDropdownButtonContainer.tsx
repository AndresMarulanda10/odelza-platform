import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

type StyledDropdownButtonProps = {
  isUnfolded: boolean;
  isActive?: boolean;
  transparentBackground?: boolean;
};

export const StyledDropdownButtonContainer = styled.div<StyledDropdownButtonProps>`
  align-items: center;
  background: ${({ isUnfolded, transparentBackground }) =>
    transparentBackground
      ? 'none'
      : isUnfolded
        ? odelzaThemeCssVariables.background.transparent.light
        : odelzaThemeCssVariables.background.primary};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  color: ${({ isActive }) =>
    isActive
      ? odelzaThemeCssVariables.color.primary
      : odelzaThemeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;

  padding: ${odelzaThemeCssVariables.spacing[1]};
  padding-left: ${odelzaThemeCssVariables.spacing[1]};

  padding-right: ${odelzaThemeCssVariables.spacing[2]};
  user-select: none;

  &:hover {
    background: ${({ isUnfolded, transparentBackground }) =>
      transparentBackground
        ? 'transparent'
        : isUnfolded
          ? odelzaThemeCssVariables.background.transparent.medium
          : odelzaThemeCssVariables.background.transparent.light};
  }
`;
