import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

type StyledDropdownButtonProps = {
  isUnfolded?: boolean;
  isActive?: boolean;
};

export const StyledHeaderDropdownButton = styled.button<StyledDropdownButtonProps>`
  align-items: center;
  background: ${({ isUnfolded }) =>
    isUnfolded
      ? odelzaThemeCssVariables.background.transparent.light
      : odelzaThemeCssVariables.background.primary};
  border: none;
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  color: ${({ isActive }) =>
    isActive
      ? odelzaThemeCssVariables.color.primary
      : odelzaThemeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;

  font-family: inherit;
  padding: ${odelzaThemeCssVariables.spacing[1]};

  padding-left: ${odelzaThemeCssVariables.spacing[2]};
  padding-right: ${odelzaThemeCssVariables.spacing[2]};

  user-select: none;

  &:hover {
    background: ${({ isUnfolded }) =>
      isUnfolded
        ? odelzaThemeCssVariables.background.transparent.medium
        : odelzaThemeCssVariables.background.transparent.light};
  }
`;
