import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { MONOSPACE_FONT_FAMILY } from '@/ui/theme/constants/MonospaceFontFamily';
import {
  StyledSection,
  StyledSectionTitle,
} from '@/workflow/workflow-run/observability/workflowRunStepLogsStyles';

const StyledEntriesList = styled.div`
  background: ${odelzaThemeCssVariables.background.tertiary};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  font-family: ${MONOSPACE_FONT_FAMILY};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  max-height: 300px;
  overflow-y: auto;
  padding: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledEntryRow = styled.div`
  align-items: baseline;
  color: ${odelzaThemeCssVariables.font.color.primary};
  display: grid;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  grid-template-columns: max-content max-content 1fr;
  padding: ${odelzaThemeCssVariables.spacing['0.5']} 0;
`;

const StyledTimestamp = styled.span`
  color: ${odelzaThemeCssVariables.font.color.light};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
`;

const StyledLevelBadge = styled.span<{ level: string }>`
  background: ${({ level }) => {
    if (level === 'error')
      return odelzaThemeCssVariables.background.transparent.danger;
    if (level === 'warn')
      return odelzaThemeCssVariables.background.transparent.orange;
    if (level === 'info')
      return odelzaThemeCssVariables.color.transparent.blue3;
    return odelzaThemeCssVariables.background.transparent.light;
  }};
  border-radius: ${odelzaThemeCssVariables.border.radius.xs};
  color: ${({ level }) => {
    if (level === 'error') return odelzaThemeCssVariables.color.red;
    if (level === 'warn') return odelzaThemeCssVariables.color.orange;
    if (level === 'info') return odelzaThemeCssVariables.color.blue;
    return odelzaThemeCssVariables.font.color.tertiary;
  }};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  padding: 0 ${odelzaThemeCssVariables.spacing[1]};
  text-transform: uppercase;
`;

const StyledMessage = styled.span`
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleTimeString();
};

export const WorkflowRunStepLogsEntries = ({
  entries,
  onlyLatestIteration = false,
}: {
  entries: WorkflowRunStepLog['entries'];
  // Set when the parent step lives inside an iterator loop: each iteration
  // overwrites the same `stepLogs[stepId]` key, so what we render here is
  // only the latest iteration's entries — not a cumulative view.
  onlyLatestIteration?: boolean;
}) => {
  const { t } = useLingui();

  if (entries.length === 0) {
    return null;
  }

  const sectionTitle = onlyLatestIteration
    ? t`Entries (${entries.length}, latest iteration only)`
    : t`Entries (${entries.length})`;

  return (
    <StyledSection>
      <StyledSectionTitle>{sectionTitle}</StyledSectionTitle>
      <StyledEntriesList>
        {entries.map((entry, index) => (
          <StyledEntryRow key={`${entry.timestamp}-${index}`}>
            <StyledTimestamp>
              {formatTimestamp(entry.timestamp)}
            </StyledTimestamp>
            <StyledLevelBadge level={entry.level}>
              {entry.level}
            </StyledLevelBadge>
            <StyledMessage>{entry.message}</StyledMessage>
          </StyledEntryRow>
        ))}
      </StyledEntriesList>
    </StyledSection>
  );
};
