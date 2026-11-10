import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledDashContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledDash = styled.div`
  background-color: ${odelzaThemeCssVariables.font.color.light};
  height: 1.6px;
  width: ${odelzaThemeCssVariables.spacing['1.5']};
`;

export const TwoFactorAuthenticationVerificationCodeDash = () => {
  return (
    <StyledDashContainer>
      <StyledDash />
    </StyledDashContainer>
  );
};
