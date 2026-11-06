import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledSidePanelContextChipIconWrapper = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.primary};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  display: flex;
  justify-content: center;
`;

export const SidePanelContextChipIconWrapper =
  StyledSidePanelContextChipIconWrapper;
