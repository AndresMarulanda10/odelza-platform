import { CHART_MOTION_CONFIG } from '@/page-layout/widgets/graph/constants/ChartMotionConfig';
import { GraphWidgetLegendDot } from '@/page-layout/widgets/graph/components/GraphWidgetLegendDot';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';
import { styled } from '@linaria/react';
import { ResponsivePie } from '@nivo/pie';
import { useContext } from 'react';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

type UsagePieChartDatum = {
  id: string;
  value: number;
  color: string;
};

type UsagePieChartProps = {
  data: UsagePieChartDatum[];
};

const StyledContainer = styled.div`
  height: 220px;
  width: 100%;
`;

const StyledTooltip = styled.div`
  background: ${odelzaThemeCssVariables.background.primary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  box-shadow: ${odelzaThemeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledTooltipRow = styled.div`
  align-items: center;
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  gap: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledTooltipLabel = styled.span`
  color: ${odelzaThemeCssVariables.font.color.secondary};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

const StyledTooltipValue = styled.span`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  white-space: nowrap;
`;

export const UsagePieChart = ({ data }: UsagePieChartProps) => {
  const { theme } = useContext(ThemeContext);
  const { formatUsageValue } = useUsageValueFormatter();

  return (
    <StyledContainer>
      <ResponsivePie
        data={data}
        margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
        innerRadius={0.6}
        padAngle={0.5}
        cornerRadius={2}
        colors={data.map((item) => item.color)}
        enableArcLabels={false}
        enableArcLinkLabels={true}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={theme.font.color.secondary}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLinkLabelsDiagonalLength={10}
        arcLinkLabelsStraightLength={10}
        animate
        motionConfig={CHART_MOTION_CONFIG}
        tooltip={({ datum }) => (
          <StyledTooltip>
            <StyledTooltipRow>
              <GraphWidgetLegendDot color={datum.color} />
              <StyledTooltipLabel>{String(datum.id)}</StyledTooltipLabel>
              <StyledTooltipValue>
                {formatUsageValue(datum.value)}
              </StyledTooltipValue>
            </StyledTooltipRow>
          </StyledTooltip>
        )}
      />
    </StyledContainer>
  );
};
