import { GRAPH_TOOLTIP_MAX_WIDTH_PX } from '@/page-layout/widgets/graph/components/constants/GraphTooltipMaxWidthPx';
import { GRAPH_TOOLTIP_MIN_WIDTH_PX } from '@/page-layout/widgets/graph/components/constants/GraphTooltipMinWidthPx';
import { GRAPH_TOOLTIP_SCROLL_MAX_HEIGHT_PX } from '@/page-layout/widgets/graph/components/constants/GraphTooltipScrollMaxHeightPx';
import { GraphWidgetLegendDot } from '@/page-layout/widgets/graph/components/GraphWidgetLegendDot';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight } from 'twenty-ui/icon';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledTooltip = styled.div`
  background: ${odelzaThemeCssVariables.background.primary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  box-shadow: ${odelzaThemeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: min(${GRAPH_TOOLTIP_MAX_WIDTH_PX}px, calc(100vw - 40px));
  min-width: ${GRAPH_TOOLTIP_MIN_WIDTH_PX}px;
  pointer-events: auto;
`;

const StyledTooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[3]};
  padding: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledTooltipRow = styled.div`
  align-items: center;
  display: flex;

  gap: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledTooltipRowContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  max-height: ${GRAPH_TOOLTIP_SCROLL_MAX_HEIGHT_PX}px;
  overflow-y: auto;
`;

const StyledTooltipLink = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.light};
  cursor: pointer;
  display: flex;
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  height: ${odelzaThemeCssVariables.spacing[6]};
  justify-content: space-between;
  line-height: 140%;
  padding-inline: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledTooltipSeparator = styled.div`
  background-color: ${odelzaThemeCssVariables.border.color.light};
  min-height: 1px;
  width: 100%;
`;

const StyledTooltipHeader = styled.div`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  line-height: 140%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTooltipRowRightContent = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.extraLight};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: space-between;
  min-width: 0;
  width: 100%;
`;

const StyledTooltipLabel = styled.span<{ isHighlighted?: boolean }>`
  color: ${({ isHighlighted }) =>
    isHighlighted
      ? odelzaThemeCssVariables.font.color.secondary
      : odelzaThemeCssVariables.font.color.tertiary};
  flex: 1;
  font-weight: ${({ isHighlighted }) =>
    isHighlighted
      ? odelzaThemeCssVariables.font.weight.medium
      : odelzaThemeCssVariables.font.weight.regular};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledNoDataMessage = styled.span`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
`;

const StyledTooltipValue = styled.span<{ isHighlighted?: boolean }>`
  color: ${({ isHighlighted }) =>
    isHighlighted
      ? odelzaThemeCssVariables.font.color.tertiary
      : odelzaThemeCssVariables.font.color.extraLight};
  flex-shrink: 0;
  font-weight: ${({ isHighlighted }) =>
    isHighlighted
      ? odelzaThemeCssVariables.font.weight.semiBold
      : odelzaThemeCssVariables.font.weight.medium};
  white-space: nowrap;
`;

const StyledHorizontalSectionPadding = styled.div<{
  addTop?: boolean;
  addBottom?: boolean;
}>`
  margin-bottom: ${({ addBottom }) =>
    addBottom ? odelzaThemeCssVariables.spacing[1] : 0};
  margin-top: ${({ addTop }) =>
    addTop ? odelzaThemeCssVariables.spacing[1] : 0};
  padding-inline: ${odelzaThemeCssVariables.spacing[1]};
`;

export type GraphWidgetTooltipItem = {
  key: string;
  label: string;
  formattedValue: string;
  value: number;
  dotColor: string;
};

type GraphWidgetTooltipProps = {
  items: GraphWidgetTooltipItem[];
  indexLabel?: string;
  highlightedKey?: string;
  onGraphWidgetTooltipClick?: () => void;
};

export const GraphWidgetTooltip = ({
  items,
  indexLabel,
  highlightedKey,
  onGraphWidgetTooltipClick,
}: GraphWidgetTooltipProps) => {
  const { theme } = useContext(ThemeContext);

  const filteredItems = items.filter(
    (item) => item.value !== 0 && isNonEmptyString(item.formattedValue),
  );

  const hasData = filteredItems.length > 0;
  const shouldHighlight = filteredItems.length > 1;
  const shouldShowClickFooter = hasData && isDefined(onGraphWidgetTooltipClick);

  return (
    <StyledTooltip>
      <StyledHorizontalSectionPadding addTop addBottom={!shouldShowClickFooter}>
        <StyledTooltipContent>
          {indexLabel && (
            <StyledTooltipHeader>{indexLabel}</StyledTooltipHeader>
          )}
          <StyledTooltipRowContainer>
            {filteredItems.length === 0 ? (
              <StyledNoDataMessage>{t`No data`}</StyledNoDataMessage>
            ) : (
              filteredItems.map((item) => {
                const isHighlighted =
                  shouldHighlight && highlightedKey === item.key;
                return (
                  <StyledTooltipRow key={item.key}>
                    <GraphWidgetLegendDot color={item.dotColor} />
                    <StyledTooltipRowRightContent>
                      <StyledTooltipLabel isHighlighted={isHighlighted}>
                        {item.label}
                      </StyledTooltipLabel>
                      <StyledTooltipValue isHighlighted={isHighlighted}>
                        {item.formattedValue}
                      </StyledTooltipValue>
                    </StyledTooltipRowRightContent>
                  </StyledTooltipRow>
                );
              })
            )}
          </StyledTooltipRowContainer>
        </StyledTooltipContent>
      </StyledHorizontalSectionPadding>
      {shouldShowClickFooter && (
        <>
          <StyledTooltipSeparator />
          <StyledHorizontalSectionPadding addBottom>
            <StyledTooltipLink onClick={onGraphWidgetTooltipClick}>
              <span>{t`Click to see data`}</span>
              <IconArrowUpRight size={theme.icon.size.sm} />
            </StyledTooltipLink>
          </StyledHorizontalSectionPadding>
        </>
      )}
    </StyledTooltip>
  );
};
