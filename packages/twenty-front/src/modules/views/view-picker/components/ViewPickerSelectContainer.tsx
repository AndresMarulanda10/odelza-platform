import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledSelectContainer = styled.div`
  color: ${odelzaThemeCssVariables.font.color.light};
  display: flex;
  margin: ${odelzaThemeCssVariables.spacing[1]};
  user-select: none;
  width: calc(100% - ${odelzaThemeCssVariables.spacing[2]});
`;

export { StyledSelectContainer as ViewPickerSelectContainer };
