import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  background: ${odelzaThemeCssVariables.background.secondary};
  flex: 1;
  min-height: 0;
  width: 100%;
`;

export const OnboardingStepPageLoader = () => <StyledContainer />;
