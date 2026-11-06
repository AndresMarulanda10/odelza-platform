import { MONOSPACE_FONT_FAMILY } from '@/ui/theme/constants/MonospaceFontFamily';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconCopy, IconTerminal } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledHeader = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.tertiary};
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${odelzaThemeCssVariables.spacing[1]}
    ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledHeaderLeft = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledTabContainer = styled.div`
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledTab = styled.button<{ isActive: boolean; hasError?: boolean }>`
  background: ${({ isActive }) =>
    isActive ? odelzaThemeCssVariables.background.secondary : 'transparent'};
  border: none;
  border-radius: ${odelzaThemeCssVariables.border.radius.xs};
  color: ${({ isActive, hasError }) =>
    hasError
      ? odelzaThemeCssVariables.color.red
      : isActive
        ? odelzaThemeCssVariables.font.color.primary
        : odelzaThemeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  font-weight: ${({ isActive }) =>
    isActive
      ? odelzaThemeCssVariables.font.weight.medium
      : odelzaThemeCssVariables.font.weight.regular};
  padding: ${odelzaThemeCssVariables.spacing['0.5']}
    ${odelzaThemeCssVariables.spacing[1]};

  &:hover {
    background: ${odelzaThemeCssVariables.background.secondary};
    color: ${({ hasError }) =>
      hasError
        ? odelzaThemeCssVariables.color.red
        : odelzaThemeCssVariables.font.color.primary};
  }
`;

const StyledOutputArea = styled.div<{ isError?: boolean }>`
  background: ${odelzaThemeCssVariables.background.tertiary};
  color: ${({ isError }) =>
    isError
      ? odelzaThemeCssVariables.color.red
      : odelzaThemeCssVariables.font.color.primary};
  font-family: ${MONOSPACE_FONT_FAMILY};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  line-height: 1.5;
  max-height: 300px;
  min-height: 100px;
  overflow-y: auto;
  padding: ${odelzaThemeCssVariables.spacing[2]};
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledEmptyMessage = styled.div`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-style: italic;
`;

const StyledCursor = styled.span`
  animation: blink 1s step-end infinite;
  background: ${odelzaThemeCssVariables.font.color.primary};
  display: inline-block;
  height: 1em;
  margin-left: 2px;
  vertical-align: text-bottom;
  width: 8px;

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

type TabType = 'stdout' | 'stderr';

type TerminalOutputProps = {
  stdout: string;
  stderr: string;
  isRunning?: boolean;
};

export const TerminalOutput = ({
  stdout,
  stderr,
  isRunning = false,
}: TerminalOutputProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  const hasStderr = stderr.length > 0;
  const hasStdout = stdout.length > 0;

  const defaultTab: TabType = hasStderr && !hasStdout ? 'stderr' : 'stdout';
  const [userSelectedTab, setUserSelectedTab] = useState<TabType | null>(null);
  const activeTab = userSelectedTab ?? defaultTab;

  const currentOutput = activeTab === 'stdout' ? stdout : stderr;

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledHeaderLeft>
          <IconTerminal size={14} />
          {t`Output`}
        </StyledHeaderLeft>
        <StyledTabContainer>
          <StyledTab
            isActive={activeTab === 'stdout'}
            onClick={() => setUserSelectedTab('stdout')}
          >
            stdout
          </StyledTab>
          {hasStderr && (
            <StyledTab
              isActive={activeTab === 'stderr'}
              hasError
              onClick={() => setUserSelectedTab('stderr')}
            >
              stderr
            </StyledTab>
          )}
          <LightIconButton
            Icon={IconCopy}
            onClick={() => copyToClipboard(currentOutput)}
            title={t`Copy output`}
            size="small"
            accent="tertiary"
          />
        </StyledTabContainer>
      </StyledHeader>
      <StyledOutputArea isError={activeTab === 'stderr'}>
        {currentOutput ? (
          <>
            {currentOutput}
            {isRunning && <StyledCursor />}
          </>
        ) : (
          <StyledEmptyMessage>
            {isRunning ? t`Waiting for output...` : t`No output`}
          </StyledEmptyMessage>
        )}
      </StyledOutputArea>
    </StyledContainer>
  );
};
