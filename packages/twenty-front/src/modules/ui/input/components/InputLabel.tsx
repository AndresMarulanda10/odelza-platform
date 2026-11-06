import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledLabel = styled.label`
  color: ${odelzaThemeCssVariables.font.color.light};
  display: block;
  font-size: 11px;
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  margin-bottom: ${odelzaThemeCssVariables.spacing[1]};
`;

export const InputLabel = StyledLabel;
