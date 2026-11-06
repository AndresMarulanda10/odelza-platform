import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconCoins, IconInfoCircle } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import {
  MOBILE_VIEWPORT,
  odelzaThemeCssVariables,
  useTheme,
} from 'twenty-ui/theme-constants';

const StyledHeader = styled.div`
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  padding: ${odelzaThemeCssVariables.spacing[8]}
    ${odelzaThemeCssVariables.spacing[8]} 1px;
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${odelzaThemeCssVariables.spacing[8]}
      ${odelzaThemeCssVariables.spacing[4]} 1px;
  }
`;

const StyledSide = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex: 1 1 0;
  min-width: 0;
`;

const StyledLeftSide = styled(StyledSide)`
  justify-content: flex-end;
  padding-right: ${odelzaThemeCssVariables.spacing[1]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    justify-content: flex-start;
  }
`;

const StyledCenter = styled.div`
  align-items: center;
  display: flex;
  flex: 0 1 ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
  justify-content: flex-start;
  min-width: 0;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-basis: auto;
  }
`;

const StyledRightSide = styled(StyledSide)`
  justify-content: flex-end;
  padding-left: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledLogo = styled.div`
  background-image: url('/images/odelza/icon.svg');
  background-size: cover;
  height: ${odelzaThemeCssVariables.spacing[6]};
  opacity: 0.4;
  width: ${odelzaThemeCssVariables.spacing[6]};
`;

const StyledFreeCredits = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
`;

const StyledCreditsTag = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.tertiary};
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-bottom-left-radius: ${odelzaThemeCssVariables.border.radius.pill};
  border-left: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-top: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-top-left-radius: ${odelzaThemeCssVariables.border.radius.pill};
  box-sizing: border-box;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: ${odelzaThemeCssVariables.spacing[6]};
  padding: 0 ${odelzaThemeCssVariables.spacing[2]} 0
    ${odelzaThemeCssVariables.spacing['1.5']};
`;

const StyledCreditsCount = styled.span`
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

const StyledCreditsLabel = styled.span`
  font-size: ${odelzaThemeCssVariables.font.size.sm};
`;

const StyledInfoTag = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.tertiary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-bottom-right-radius: ${odelzaThemeCssVariables.border.radius.rounded};
  border-top-right-radius: ${odelzaThemeCssVariables.border.radius.rounded};
  box-sizing: border-box;
  display: flex;
  height: ${odelzaThemeCssVariables.spacing[6]};
  justify-content: center;
  padding: 0 ${odelzaThemeCssVariables.spacing['1.5']} 0
    ${odelzaThemeCssVariables.spacing[1]};
`;

type OnboardingHeaderProps = {
  onBack?: () => void;
  freeCredits?: number;
};

export const OnboardingHeader = ({
  onBack,
  freeCredits,
}: OnboardingHeaderProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledHeader>
      <StyledLeftSide>
        {isDefined(onBack) && (
          <LightIconButton
            Icon={IconChevronLeft}
            accent="tertiary"
            size="small"
            onClick={onBack}
            aria-label={t`Go back`}
          />
        )}
      </StyledLeftSide>
      <StyledCenter>
        <StyledLogo />
      </StyledCenter>
      <StyledRightSide>
        {isDefined(freeCredits) && (
          <StyledFreeCredits>
            <StyledCreditsTag>
              <IconCoins
                size={theme.icon.size.md}
                color={odelzaThemeCssVariables.font.color.tertiary}
              />
              <StyledCreditsCount>{freeCredits}</StyledCreditsCount>
              <StyledCreditsLabel>{t`free credits`}</StyledCreditsLabel>
            </StyledCreditsTag>
            <StyledInfoTag>
              <IconInfoCircle
                size={theme.icon.size.md}
                color={odelzaThemeCssVariables.font.color.tertiary}
              />
            </StyledInfoTag>
          </StyledFreeCredits>
        )}
      </StyledRightSide>
    </StyledHeader>
  );
};
