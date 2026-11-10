import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

const StyledSelectStepTitle = styled.span`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  padding-bottom: ${odelzaThemeCssVariables.spacing[1]};
  padding-left: ${odelzaThemeCssVariables.spacing[1]};
  padding-right: ${odelzaThemeCssVariables.spacing[1]};
  padding-top: ${odelzaThemeCssVariables.spacing[2]};
`;

export { StyledSelectStepTitle as SidePanelWorkflowSelectStepTitle };
