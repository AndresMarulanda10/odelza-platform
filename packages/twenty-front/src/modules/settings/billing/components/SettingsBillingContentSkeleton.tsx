import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledBillingContentSkeleton = styled.div`
  background: linear-gradient(
    90deg,
    ${odelzaThemeCssVariables.background.transparent.light} 0%,
    ${odelzaThemeCssVariables.background.transparent.lighter} 100%
  );
  border-radius: ${odelzaThemeCssVariables.border.radius.md} 0 0
    ${odelzaThemeCssVariables.border.radius.md};
  height: ${odelzaThemeCssVariables.spacing[6]};
  width: 160px;
`;

export const SettingsBillingContentSkeleton = () => (
  <SettingsPageContainer>
    <StyledBillingContentSkeleton />
  </SettingsPageContainer>
);
