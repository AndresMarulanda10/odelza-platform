import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledIconAndNameContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  margin-left: ${odelzaThemeCssVariables.spacing[1]};
  margin-right: ${odelzaThemeCssVariables.spacing[1]};
`;

export { StyledIconAndNameContainer as ViewPickerIconAndNameContainer };
