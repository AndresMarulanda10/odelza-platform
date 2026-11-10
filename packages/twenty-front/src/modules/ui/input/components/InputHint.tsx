import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

const StyledInputHint = styled.div<{
  danger?: boolean;
}>`
  color: ${({ danger }) =>
    danger
      ? odelzaThemeCssVariables.font.color.danger
      : odelzaThemeCssVariables.font.color.light};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  margin-top: ${odelzaThemeCssVariables.spacing[0.5]};
`;

export { StyledInputHint as InputHint };
