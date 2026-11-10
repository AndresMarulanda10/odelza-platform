import { styled } from '@linaria/react';
import { IconArrowRight, IconGoogle, IconMicrosoft } from 'twenty-ui/icon';
import { odelzaThemeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const SYNC_BADGE_LOGO_SIZE = 16;

const StyledBadge = styled.div`
  align-items: center;
  backdrop-filter: blur(20px);
  background-color: ${odelzaThemeCssVariables.background.transparent.secondary};
  border: 1px solid ${odelzaThemeCssVariables.background.transparent.lighter};
  border-left: none;
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  box-shadow: ${odelzaThemeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  left: 50%;
  padding: ${odelzaThemeCssVariables.spacing[2]};
  position: absolute;
  top: 83px;
  transform: translateX(-50%);
`;

const StyledDivider = styled.div`
  align-self: stretch;
  background-color: ${odelzaThemeCssVariables.border.color.medium};
  width: 1px;
`;

const StyledTwentyLogo = styled.img`
  border-radius: ${odelzaThemeCssVariables.border.radius.xs};
  height: ${SYNC_BADGE_LOGO_SIZE}px;
  width: ${SYNC_BADGE_LOGO_SIZE}px;
`;

export const OnboardingImportPreviewSyncBadge = () => {
  const theme = useTheme();

  return (
    <StyledBadge>
      <IconGoogle size={theme.icon.size.md} />
      <IconMicrosoft size={theme.icon.size.md} />
      <StyledDivider />
      <IconArrowRight
        size={theme.icon.size.md}
        color={odelzaThemeCssVariables.font.color.tertiary}
      />
      <StyledTwentyLogo src="/images/odelza/icon.svg" alt="" />
    </StyledBadge>
  );
};
