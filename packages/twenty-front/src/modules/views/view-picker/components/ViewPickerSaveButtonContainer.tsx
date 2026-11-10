import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledSaveButtonContainer = styled.div`
  display: flex;
  padding: ${odelzaThemeCssVariables.spacing[1]};
  width: calc(100% - ${odelzaThemeCssVariables.spacing[2]});
`;

export { StyledSaveButtonContainer as ViewPickerSaveButtonContainer };
