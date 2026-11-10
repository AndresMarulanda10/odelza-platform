import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export const StyledOnboardingStepTagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  padding-top: ${odelzaThemeCssVariables.spacing[1]};
`;
