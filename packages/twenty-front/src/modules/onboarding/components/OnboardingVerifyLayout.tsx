import { OnboardingPulsingLogo } from '@/onboarding/components/OnboardingPulsingLogo';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

type OnboardingVerifyLayoutProps = {
  children: ReactNode;
};

export const OnboardingVerifyLayout = ({
  children,
}: OnboardingVerifyLayoutProps) => (
  <StyledContainer>
    <OnboardingPulsingLogo />
    {children}
  </StyledContainer>
);
