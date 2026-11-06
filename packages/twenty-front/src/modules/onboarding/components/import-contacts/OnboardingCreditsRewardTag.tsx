import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCoins } from 'twenty-ui/icon';
import { odelzaThemeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledTag = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.color.green3};
  border: 1px solid ${odelzaThemeCssVariables.color.green4};
  border-radius: ${odelzaThemeCssVariables.border.radius.xxl};
  box-sizing: border-box;
  color: ${odelzaThemeCssVariables.color.green9};
  corner-shape: round;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: ${odelzaThemeCssVariables.spacing[6]};
  padding: 0 ${odelzaThemeCssVariables.spacing[2]} 0
    ${odelzaThemeCssVariables.spacing['1.5']};
`;

const StyledLabel = styled.span`
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  line-height: 1.4;
`;

const StyledSuffix = styled.span`
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  line-height: 1.4;
`;

type OnboardingCreditsRewardTagProps = {
  amount: number;
  suffix?: string;
};

export const OnboardingCreditsRewardTag = ({
  amount,
  suffix,
}: OnboardingCreditsRewardTagProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledTag>
      <IconCoins
        size={theme.icon.size.md}
        color={odelzaThemeCssVariables.color.green9}
      />
      <StyledLabel>{t`Earn +${amount}`}</StyledLabel>
      <StyledSuffix>{suffix ?? t`free credits`}</StyledSuffix>
    </StyledTag>
  );
};
