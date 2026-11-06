import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCalendarEvent } from 'twenty-ui/icon';
import { odelzaThemeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledTag = styled.div`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.color.green3};
  border: 1px solid ${odelzaThemeCssVariables.color.green4};
  border-radius: ${odelzaThemeCssVariables.border.radius.pill};
  box-sizing: border-box;
  color: ${odelzaThemeCssVariables.color.green9};
  corner-shape: round;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: ${odelzaThemeCssVariables.spacing[6]};
  padding: 0 ${odelzaThemeCssVariables.spacing[2]} 0
    ${odelzaThemeCssVariables.spacing['1.5']};
`;

const StyledPrefix = styled.span`
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
`;

const StyledDuration = styled.span`
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

const StyledSuffix = styled.span`
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
`;

type OnboardingTrialExtensionTagProps = {
  duration: number;
};

export const OnboardingTrialExtensionTag = ({
  duration,
}: OnboardingTrialExtensionTagProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledTag>
      <IconCalendarEvent
        size={theme.icon.size.md}
        color={odelzaThemeCssVariables.color.green9}
      />
      <StyledPrefix>{t`Extended`}</StyledPrefix>
      <StyledDuration>{duration}</StyledDuration>
      <StyledSuffix>{t`days trial`}</StyledSuffix>
    </StyledTag>
  );
};
