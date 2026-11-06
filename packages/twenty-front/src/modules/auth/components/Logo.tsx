import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath } from 'twenty-shared/types';
import { getImageAbsoluteURI, isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useRedirectToDefaultDomain } from '~/modules/domain-manager/hooks/useRedirectToDefaultDomain';

type LogoProps = {
  primaryLogo?: string | null;
  secondaryLogo?: string | null;
  placeholder?: string | null;
  onClick?: () => void;
  to?: AppPath;
};

const StyledContainer = styled.div`
  height: ${odelzaThemeCssVariables.spacing[12]};
  margin-bottom: ${odelzaThemeCssVariables.spacing[4]};
  margin-top: ${odelzaThemeCssVariables.spacing[4]};

  position: relative;
  width: ${odelzaThemeCssVariables.spacing[12]};
`;

const StyledSecondaryLogo = styled.img`
  border-radius: ${odelzaThemeCssVariables.border.radius.xs};
  height: ${odelzaThemeCssVariables.spacing[6]};
  width: ${odelzaThemeCssVariables.spacing[6]};
`;

const StyledSecondaryLogoContainer = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.primary};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  bottom: calc(-1 * ${odelzaThemeCssVariables.spacing[3]});
  display: flex;
  height: ${odelzaThemeCssVariables.spacing[7]};
  justify-content: center;

  position: absolute;
  right: calc(-1 * ${odelzaThemeCssVariables.spacing[3]});
  width: ${odelzaThemeCssVariables.spacing[7]};
`;

const StyledPrimaryLogo = styled.div`
  background-size: cover;
  height: 100%;
  width: 100%;
`;

export const Logo = ({
  primaryLogo,
  secondaryLogo,
  placeholder,
  onClick,
  to = AppPath.SignInUp,
}: LogoProps) => {
  const { redirectToDefaultDomain } = useRedirectToDefaultDomain();
  const defaultPrimaryLogoUrl = `${window.location.origin}/images/odelza/icon-192.png`;

  const primaryLogoUrl = getImageAbsoluteURI({
    imageUrl: primaryLogo ?? defaultPrimaryLogoUrl,
    baseUrl: REACT_APP_SERVER_BASE_URL,
  });

  const secondaryLogoUrl = isNonEmptyString(secondaryLogo)
    ? getImageAbsoluteURI({
        imageUrl: secondaryLogo,
        baseUrl: REACT_APP_SERVER_BASE_URL,
      })
    : null;

  const isUsingDefaultLogo = !isDefined(primaryLogo);

  return (
    <StyledContainer onClick={() => onClick?.()}>
      {isUsingDefaultLogo ? (
        <UndecoratedLink to={to} onClick={() => redirectToDefaultDomain()}>
          <StyledPrimaryLogo
            style={{ backgroundImage: `url(${primaryLogoUrl})` }}
          />
        </UndecoratedLink>
      ) : (
        <StyledPrimaryLogo
          style={{ backgroundImage: `url(${primaryLogoUrl})` }}
        />
      )}
      {isDefined(secondaryLogoUrl) ? (
        <StyledSecondaryLogoContainer>
          <StyledSecondaryLogo src={secondaryLogoUrl} />
        </StyledSecondaryLogoContainer>
      ) : (
        isDefined(placeholder) && (
          <StyledSecondaryLogoContainer>
            <Avatar
              size="lg"
              placeholder={placeholder}
              type="squared"
              placeholderColorSeed={placeholder}
            />
          </StyledSecondaryLogoContainer>
        )
      )}
    </StyledContainer>
  );
};
