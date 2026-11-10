import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledSubscriptionInfoContainer = styled.div`
  background-color: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[3]};
  padding: ${odelzaThemeCssVariables.spacing[3]};
  width: 100%;
`;

export { StyledSubscriptionInfoContainer as SubscriptionInfoContainer };
