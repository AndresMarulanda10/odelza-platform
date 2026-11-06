import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { type QueueJob } from '~/generated-admin/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type SettingsAdminJobDetailsExpandableProps = {
  job: QueueJob;
  isExpanded: boolean;
};

const StyledDetailsContainer = styled.div`
  background-color: ${odelzaThemeCssVariables.background.secondary};
  border-top: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  padding: ${odelzaThemeCssVariables.spacing[4]};
`;

const StyledSection = styled.div`
  margin-bottom: ${odelzaThemeCssVariables.spacing[4]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const StyledSectionTitle = styled.div`
  color: ${odelzaThemeCssVariables.font.color.secondary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  margin-bottom: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledPreformattedText = styled.pre`
  background-color: ${odelzaThemeCssVariables.background.primary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  color: ${odelzaThemeCssVariables.font.color.danger};
  font-family: ${odelzaThemeCssVariables.font.family};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  margin: 0;
  max-height: 300px;
  overflow: auto;
  padding: ${odelzaThemeCssVariables.spacing[2]};
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledLogEntry = styled.div`
  background-color: ${odelzaThemeCssVariables.background.primary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  font-family: ${odelzaThemeCssVariables.font.family};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  margin-bottom: ${odelzaThemeCssVariables.spacing[1]};
  padding: ${odelzaThemeCssVariables.spacing[2]};
`;

export const SettingsAdminJobDetailsExpandable = ({
  job,
  isExpanded,
}: SettingsAdminJobDetailsExpandableProps) => {
  const { copyToClipboard } = useCopyToClipboard();

  const hasData = job.data && Object.keys(job.data).length > 0;
  const hasReturnValue =
    job.returnValue && Object.keys(job.returnValue).length > 0;
  const hasLogs = job.logs && job.logs.length > 0;
  const hasStacktrace = job.stackTrace && job.stackTrace.length > 0;
  const hasFailedReason = job.failedReason;

  const isAnyNode = () => true;

  return (
    <AnimatedExpandableContainer
      isExpanded={isExpanded}
      dimension="height"
      mode="scroll-height"
    >
      <StyledDetailsContainer>
        {hasFailedReason && (
          <StyledSection>
            <StyledSectionTitle>{t`Error Message`}</StyledSectionTitle>
            <StyledPreformattedText>{job.failedReason}</StyledPreformattedText>
          </StyledSection>
        )}

        {hasStacktrace && job.stackTrace && (
          <StyledSection>
            <StyledSectionTitle>{t`Stack Trace`}</StyledSectionTitle>
            <StyledPreformattedText>
              {job.stackTrace.join('\n')}
            </StyledPreformattedText>
          </StyledSection>
        )}

        {hasReturnValue && (
          <StyledSection>
            <StyledSectionTitle>{t`Return Value`}</StyledSectionTitle>
            <JsonTree
              value={job.returnValue}
              shouldExpandNodeInitially={isAnyNode}
              emptyArrayLabel={t`Empty Array`}
              emptyObjectLabel={t`Empty Object`}
              emptyStringLabel={t`[empty string]`}
              arrowButtonCollapsedLabel={t`Expand`}
              arrowButtonExpandedLabel={t`Collapse`}
              onNodeValueClick={copyToClipboard}
            />
          </StyledSection>
        )}

        {hasData && (
          <StyledSection>
            <StyledSectionTitle>{t`Job Data`}</StyledSectionTitle>
            <JsonTree
              value={job.data}
              shouldExpandNodeInitially={isAnyNode}
              emptyArrayLabel={t`Empty Array`}
              emptyObjectLabel={t`Empty Object`}
              emptyStringLabel={t`[empty string]`}
              arrowButtonCollapsedLabel={t`Expand`}
              arrowButtonExpandedLabel={t`Collapse`}
              onNodeValueClick={copyToClipboard}
            />
          </StyledSection>
        )}

        {hasLogs && (
          <StyledSection>
            <StyledSectionTitle>{t`Logs`}</StyledSectionTitle>
            {job.logs?.map((log, index) => (
              <StyledLogEntry key={index}>{log}</StyledLogEntry>
            ))}
          </StyledSection>
        )}
      </StyledDetailsContainer>
    </AnimatedExpandableContainer>
  );
};
