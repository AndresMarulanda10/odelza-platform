import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledHr = styled.hr`
  border: none;
  border-top: 1px solid ${odelzaThemeCssVariables.border.color.light};
  margin: 0px;
  margin-left: ${odelzaThemeCssVariables.spacing[4]};
  margin-right: ${odelzaThemeCssVariables.spacing[4]};
`;

export const Separator = () => {
  return <StyledHr />;
};
