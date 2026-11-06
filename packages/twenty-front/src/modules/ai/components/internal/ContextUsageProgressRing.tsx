import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type ContextUsageProgressRingProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
};

const StyledSvg = styled.svg`
  transform: rotate(-90deg);
`;

const StyledBackgroundCircle = styled.circle`
  fill: none;
  stroke: color-mix(
    in srgb,
    ${odelzaThemeCssVariables.border.color.strong} 50%,
    ${odelzaThemeCssVariables.background.quaternary} 50%
  );
`;

const StyledProgressCircle = styled.circle`
  fill: none;
  transition: stroke-dashoffset 0.3s ease;
`;

export const ContextUsageProgressRing = ({
  percentage,
  size = 16,
  strokeWidth = 2,
}: ContextUsageProgressRingProps) => {
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (normalizedPercentage / 100) * circumference;

  const progressColor =
    normalizedPercentage > 80
      ? odelzaThemeCssVariables.color.red
      : normalizedPercentage > 60
        ? odelzaThemeCssVariables.color.orange
        : odelzaThemeCssVariables.color.primary;

  return (
    <StyledSvg width={size} height={size}>
      <StyledBackgroundCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      <StyledProgressCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        style={{ stroke: progressColor }}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </StyledSvg>
  );
};
