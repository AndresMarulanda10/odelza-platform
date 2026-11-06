import { styled } from '@linaria/react';
import type { LineSeries, Point } from '@nivo/line';
import { type ReactElement } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledTooltipContainer = styled.div`
  backdrop-filter: ${odelzaThemeCssVariables.blur.medium};
  background-color: ${odelzaThemeCssVariables.background.transparent.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  box-shadow: ${odelzaThemeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledTooltipItem = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.primary};
  display: flex;
`;

const StyledTooltipColorCircle = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 50%;
  corner-shape: round;
  height: 8px;
  margin-right: ${odelzaThemeCssVariables.spacing[2]};
  width: 8px;
`;

const StyledTooltipDataRow = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: space-between;
  width: 100%;
`;

const StyledTooltipValue = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

type SettingsAdminWorkerMetricsTooltipProps = {
  slice: {
    points: readonly Point<LineSeries>[];
  };
};

export const SettingsAdminWorkerMetricsTooltip = ({
  slice,
}: SettingsAdminWorkerMetricsTooltipProps): ReactElement => {
  return (
    <StyledTooltipContainer>
      {slice.points.map((point) => (
        <StyledTooltipItem key={point.id} color={point.seriesColor}>
          <StyledTooltipColorCircle color={point.seriesColor} />
          <StyledTooltipDataRow>
            <span>{point.seriesId}</span>
            <StyledTooltipValue>{point.data.yFormatted}</StyledTooltipValue>
          </StyledTooltipDataRow>
        </StyledTooltipItem>
      ))}
    </StyledTooltipContainer>
  );
};
