import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export const StyledSettingsBillingCard = styled.div`
  background-color: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
`;

export const StyledSettingsBillingCardHeader = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.transparent.lighter};
  border-bottom: 1px solid
    ${odelzaThemeCssVariables.background.transparent.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${odelzaThemeCssVariables.spacing[3]};
`;
