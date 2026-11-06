import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  width: 100%;
`;

export const AdvancedFilterSidePanelColumn = StyledColumn;
