import { OnboardingHeader } from '@/onboarding/components/OnboardingHeader';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledBackground = styled.div`
  background: ${odelzaThemeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100%;
`;

type OnboardingLayoutProps = {
  children: ReactNode;
  onBack?: () => void;
  freeCredits?: number;
};

export const OnboardingLayout = ({
  children,
  onBack,
  freeCredits,
}: OnboardingLayoutProps) => (
  <StyledBackground>
    <OnboardingHeader onBack={onBack} freeCredits={freeCredits} />
    {children}
  </StyledBackground>
);
