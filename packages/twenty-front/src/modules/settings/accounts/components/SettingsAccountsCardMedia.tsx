import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledCardMedia = styled.div`
  align-items: center;
  border: 2px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  color: ${odelzaThemeCssVariables.font.color.light};
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing['0.5']};
  height: ${odelzaThemeCssVariables.spacing[8]};
  justify-content: center;
  padding: ${odelzaThemeCssVariables.spacing['0.5']};
  width: ${odelzaThemeCssVariables.spacing[6]};
`;

export { StyledCardMedia as SettingsAccountsCardMedia };
