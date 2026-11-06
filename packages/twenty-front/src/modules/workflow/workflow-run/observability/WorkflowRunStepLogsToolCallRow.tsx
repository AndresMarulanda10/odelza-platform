import { styled } from '@linaria/react';
import { useContext, useState } from 'react';
import { type AiToolCallLog } from 'twenty-shared/workflow';

import { useToolDisplayContext } from '@/ai/hooks/useToolDisplayContext';
import { getToolDisplayMessage } from '@/ai/utils/tool-display/get-tool-display-message';
import { getToolIcon } from '@/ai/utils/getToolIcon';
import { useLingui } from '@lingui/react/macro';
import { type JsonValue } from 'type-fest';
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCircleX,
} from 'twenty-ui/icon';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: ${odelzaThemeCssVariables.font.family};
  gap: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledToggleButton = styled.button<{ isExpandable: boolean }>`
  align-items: center;
  background: none;
  border: none;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  cursor: ${({ isExpandable }) => (isExpandable ? 'pointer' : 'default')};
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  justify-content: space-between;
  padding: ${odelzaThemeCssVariables.spacing[1]} 0;
  text-align: left;
  transition: color
    calc(${odelzaThemeCssVariables.animation.duration.fast} * 1s) ease-in-out;
  width: 100%;

  &:hover {
    color: ${odelzaThemeCssVariables.font.color.primary};
  }
`;

const StyledLeftContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledRightContent = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;

  svg {
    min-width: calc(${odelzaThemeCssVariables.icon.size.sm} * 1px);
  }
`;

const StyledDisplayMessage = styled.span`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledToolBadge = styled.span`
  background: ${odelzaThemeCssVariables.background.transparent.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.xs};
  color: ${odelzaThemeCssVariables.font.color.light};
  font-family: ${odelzaThemeCssVariables.font.family};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  padding: ${odelzaThemeCssVariables.spacing['0.5']}
    ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledContentContainer = styled.div`
  background: ${odelzaThemeCssVariables.background.transparent.lighter};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  min-width: 0;
  padding: ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledTabContainer = styled.div`
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.light};
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[3]};
  margin-bottom: ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  background: none;
  border: none;
  color: ${({ isActive }) =>
    isActive
      ? odelzaThemeCssVariables.font.color.primary
      : odelzaThemeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${({ isActive }) =>
    isActive
      ? odelzaThemeCssVariables.font.weight.medium
      : odelzaThemeCssVariables.font.weight.regular};
  padding: 0 0 ${odelzaThemeCssVariables.spacing[2]};

  &:hover {
    color: ${odelzaThemeCssVariables.font.color.primary};
  }
`;

const StyledJsonTreeContainer = styled.div`
  overflow-x: auto;

  ul {
    min-width: 0;
  }
`;

const StyledErrorMessage = styled.div`
  color: ${odelzaThemeCssVariables.color.red};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  white-space: pre-wrap;
  word-break: break-word;
`;

type TabType = 'output' | 'input';

export const WorkflowRunStepLogsToolCallRow = ({
  toolCall,
}: {
  toolCall: AiToolCallLog;
}) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('output');

  const hasError = toolCall.state === 'error';
  const hasOutput = isDefined(toolCall.output);
  const hasInput = isDefined(toolCall.input);
  const isExpandable = hasOutput || hasInput || hasError;

  const ToolIcon = getToolIcon(toolCall.toolName);
  const StatusIcon = hasError ? IconCircleX : IconCheck;
  const statusColor = hasError
    ? odelzaThemeCssVariables.color.red
    : odelzaThemeCssVariables.color.green;

  const displayContext = useToolDisplayContext();
  const displayMessage = getToolDisplayMessage({
    input: toolCall.input ?? {},
    toolName: toolCall.toolName,
    isFinished: true,
    displayContext,
    output: toolCall.output,
  });

  return (
    <StyledContainer>
      <StyledToggleButton
        type="button"
        isExpandable={isExpandable}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      >
        <StyledLeftContent>
          <StyledIconContainer>
            <ToolIcon size={theme.icon.size.sm} />
          </StyledIconContainer>
          <StyledDisplayMessage>{displayMessage}</StyledDisplayMessage>
        </StyledLeftContent>
        <StyledRightContent>
          <StyledToolBadge>{toolCall.toolName}</StyledToolBadge>
          <StyledIconContainer style={{ color: statusColor }}>
            <StatusIcon size={theme.icon.size.sm} />
          </StyledIconContainer>
          {isExpandable &&
            (isExpanded ? (
              <IconChevronUp size={theme.icon.size.sm} />
            ) : (
              <IconChevronDown size={theme.icon.size.sm} />
            ))}
        </StyledRightContent>
      </StyledToggleButton>

      {isExpandable && (
        <AnimatedExpandableContainer isExpanded={isExpanded} mode="fit-content">
          <StyledContentContainer>
            {hasError && isDefined(toolCall.errorMessage) ? (
              <StyledErrorMessage>{toolCall.errorMessage}</StyledErrorMessage>
            ) : (
              <>
                <StyledTabContainer>
                  <StyledTab
                    type="button"
                    isActive={activeTab === 'output'}
                    onClick={() => setActiveTab('output')}
                  >
                    {t`Output`}
                  </StyledTab>
                  <StyledTab
                    type="button"
                    isActive={activeTab === 'input'}
                    onClick={() => setActiveTab('input')}
                  >
                    {t`Input`}
                  </StyledTab>
                </StyledTabContainer>

                <StyledJsonTreeContainer>
                  <JsonTree
                    value={
                      (activeTab === 'output'
                        ? (toolCall.output ?? t`No output`)
                        : (toolCall.input ?? t`No input`)) as JsonValue
                    }
                    shouldExpandNodeInitially={() => false}
                    emptyArrayLabel={t`Empty Array`}
                    emptyObjectLabel={t`Empty Object`}
                    emptyStringLabel={t`[empty string]`}
                    arrowButtonCollapsedLabel={t`Expand`}
                    arrowButtonExpandedLabel={t`Collapse`}
                    onNodeValueClick={copyToClipboard}
                  />
                </StyledJsonTreeContainer>
              </>
            )}
          </StyledContentContainer>
        </AnimatedExpandableContainer>
      )}
    </StyledContainer>
  );
};
