import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { MONOSPACE_FONT_FAMILY } from '@/ui/theme/constants/MonospaceFontFamily';

export const StyledSummaryCard = styled.div`
  background: ${odelzaThemeCssVariables.background.transparent.lighter};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[3]};
  padding: ${odelzaThemeCssVariables.spacing[3]};
`;

export const StyledSummaryHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: space-between;
`;

export const StyledHeaderLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  min-width: 0;
`;

export const StyledTitle = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

export const StyledBadgeGroup = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

export const StyledStatusBadge = styled.span<{ isSuccess: boolean }>`
  align-items: center;
  background: ${({ isSuccess }) =>
    isSuccess
      ? odelzaThemeCssVariables.background.transparent.success
      : odelzaThemeCssVariables.background.transparent.danger};
  border-radius: ${odelzaThemeCssVariables.border.radius.xs};
  color: ${({ isSuccess }) =>
    isSuccess
      ? odelzaThemeCssVariables.color.green
      : odelzaThemeCssVariables.color.red};
  display: inline-flex;
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  padding: ${odelzaThemeCssVariables.spacing['0.5']}
    ${odelzaThemeCssVariables.spacing[1]};
`;

export const StyledMetricsRow = styled.div`
  align-items: stretch;
  display: grid;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
`;

export const StyledMetric = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

export const StyledMetricLabel = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  text-transform: uppercase;
`;

export const StyledMetricValue = styled.div`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.lg};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
`;

export const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
`;

export const StyledSectionTitle = styled.h3`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  margin: 0;
  text-transform: uppercase;
`;

export const StyledErrorCard = styled.div`
  background: ${odelzaThemeCssVariables.background.transparent.danger};
  border: 1px solid ${odelzaThemeCssVariables.color.red};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding: ${odelzaThemeCssVariables.spacing[3]};
`;

export const StyledErrorMessageText = styled.div`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-family: ${MONOSPACE_FONT_FAMILY};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  white-space: pre-wrap;
  word-break: break-word;
`;

export const StyledEmptyHint = styled.div`
  color: ${odelzaThemeCssVariables.font.color.light};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-style: italic;
`;

export const StyledBodyMeta = styled.div`
  color: ${odelzaThemeCssVariables.font.color.light};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
`;
