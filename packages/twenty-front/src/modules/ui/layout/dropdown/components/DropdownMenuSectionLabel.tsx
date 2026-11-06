import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

const StyledDropdownMenuSectionLabel = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.transparent.lighter};
  box-sizing: border-box;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.xxs};
  justify-content: flex-start;
  min-height: 20px;
  padding-left: ${odelzaThemeCssVariables.spacing[2]};
  padding-right: ${odelzaThemeCssVariables.spacing[2]};
  user-select: none;
  width: 100%;
`;

export type DropdownMenuSectionLabelProps = {
  label: string;
};

export const DropdownMenuSectionLabel = ({
  label,
}: DropdownMenuSectionLabelProps) => {
  return (
    <StyledDropdownMenuSectionLabel data-dropdown-menu-section-label>
      {label}
    </StyledDropdownMenuSectionLabel>
  );
};
