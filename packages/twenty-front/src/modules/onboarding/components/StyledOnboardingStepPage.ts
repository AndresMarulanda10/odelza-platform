import { styled } from '@linaria/react';
import {
  MOBILE_VIEWPORT,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

export const StyledOnboardingStepPage = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[14]};
  min-height: 0;
  overflow-y: auto;
  padding: ${odelzaThemeCssVariables.spacing[16]}
    ${odelzaThemeCssVariables.spacing[8]};
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    gap: ${odelzaThemeCssVariables.spacing[8]};
    padding: ${odelzaThemeCssVariables.spacing[8]}
      ${odelzaThemeCssVariables.spacing[4]};
  }
`;
