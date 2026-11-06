import { styled } from '@linaria/react';
import { useContext, useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { Avatar } from 'twenty-ui/data-display';
import { IconRefresh } from 'twenty-ui/icon';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

type AppConnectionHeaderProps = {
  appLogoUrl?: string | null;
  appName: string;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: center;
`;

const StyledAppLogoTile = styled.div`
  align-items: center;
  backdrop-filter: ${odelzaThemeCssVariables.blur.strong};
  background: ${odelzaThemeCssVariables.background.primary};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  box-shadow: ${odelzaThemeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: ${odelzaThemeCssVariables.spacing[12]};
  justify-content: center;
  padding: ${odelzaThemeCssVariables.spacing[1]};
  width: ${odelzaThemeCssVariables.spacing[12]};
`;

const StyledAppLogo = styled.img`
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  height: ${odelzaThemeCssVariables.spacing[10]};
  object-fit: cover;
  width: ${odelzaThemeCssVariables.spacing[10]};
`;

const StyledLinkIconContainer = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.primary};
  border-radius: ${odelzaThemeCssVariables.border.radius.rounded};
  box-shadow: ${odelzaThemeCssVariables.boxShadow.strong};
  color: ${odelzaThemeCssVariables.font.color.primary};
  corner-shape: round;
  display: flex;
  flex-shrink: 0;
  height: ${odelzaThemeCssVariables.spacing[6]};
  justify-content: center;
  width: ${odelzaThemeCssVariables.spacing[6]};
`;

export const AppConnectionHeader = ({
  appLogoUrl,
  appName,
}: AppConnectionHeaderProps) => {
  const { theme } = useContext(ThemeContext);

  const [hasAppLogoError, setHasAppLogoError] = useState(false);

  const showAppLogoImage = isNonEmptyString(appLogoUrl) && !hasAppLogoError;

  return (
    <StyledContainer>
      <StyledAppLogoTile>
        <StyledAppLogo src={'/images/odelza/icon.svg'} alt="" />
      </StyledAppLogoTile>
      <StyledLinkIconContainer aria-hidden>
        <IconRefresh size={theme.icon.size.md} stroke={theme.icon.stroke.lg} />
      </StyledLinkIconContainer>
      <StyledAppLogoTile>
        {showAppLogoImage ? (
          <StyledAppLogo
            src={appLogoUrl}
            alt=""
            onError={() => setHasAppLogoError(true)}
          />
        ) : (
          <Avatar
            size="xl"
            placeholder={appName}
            placeholderColorSeed={appName}
            type="squared"
          />
        )}
      </StyledAppLogoTile>
    </StyledContainer>
  );
};
