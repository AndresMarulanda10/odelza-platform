import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Label } from 'twenty-ui/typography';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledDropdownMenuSubheaderContainer = styled.div`
  background-color: ${odelzaThemeCssVariables.background.transparent.lighter};
  padding: ${odelzaThemeCssVariables.spacing[1]}
    ${odelzaThemeCssVariables.spacing[2]};
  width: 100%;
`;

export const StyledDropdownMenuSubheader = ({
  children,
}: {
  children: ReactNode;
}) => (
  <StyledDropdownMenuSubheaderContainer>
    <Label>{children}</Label>
  </StyledDropdownMenuSubheaderContainer>
);
