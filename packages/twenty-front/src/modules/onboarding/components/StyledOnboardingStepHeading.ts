import { StyledOnboardingContentBlock } from '@/onboarding/components/StyledOnboardingContentBlock';
import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export const StyledOnboardingStepHeading = styled(StyledOnboardingContentBlock)`
  gap: ${odelzaThemeCssVariables.spacing[4]};
`;
