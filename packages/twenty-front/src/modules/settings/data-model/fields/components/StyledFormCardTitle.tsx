import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export const StyledFormCardTitle = styled.h3`
  color: ${odelzaThemeCssVariables.font.color.extraLight};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  margin: 0;
  margin-bottom: ${odelzaThemeCssVariables.spacing[4]};
`;
