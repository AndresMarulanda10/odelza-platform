import { styled } from '@linaria/react';
import { EditorContent } from '@tiptap/react';
import { useLingui } from '@lingui/react/macro';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { isDefined } from 'twenty-shared/utils';

import { AiChatBanner } from '@/ai/components/AiChatBanner';
import { AiChatEmptyState } from '@/ai/components/AiChatEmptyState';
import { AiChatQuestionCard } from '@/ai/components/AiChatQuestionCard';
import { AIChatNoMoreBillingCreditsBanner } from '@/ai/components/AIChatNoMoreBillingCreditsBanner';
import { AiChatStandaloneError } from '@/ai/components/AiChatStandaloneError';
import { AgentChatContextPreview } from '@/ai/components/internal/AgentChatContextPreview';
import { AgentChatFileUploadButton } from '@/ai/components/internal/AgentChatFileUploadButton';
import { AiChatContextUsageButton } from '@/ai/components/internal/AiChatContextUsageButton';
import { AiChatEditorFocusEffect } from '@/ai/components/internal/AiChatEditorFocusEffect';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { SendMessageButton } from '@/ai/components/internal/SendMessageButton';
import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { useAiChatEditor } from '@/ai/hooks/useAiChatEditor';
import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { agentChatUserSelectedModelState } from '@/ai/states/agentChatUserSelectedModelState';
import { agentChatPendingQuestionComponentSelector } from '@/ai/states/selectors/agentChatPendingQuestionComponentSelector';
import { Select } from '@/ui/input/components/Select';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { hasReachedCurrentBillingPeriodCapSelector } from '@/workspace/states/hasReachedCurrentBillingPeriodCapSelector';
import { type SelectOption } from 'twenty-ui/input';

const StyledInputArea = styled.div<{ isMobile: boolean }>`
  align-items: flex-end;
  background: ${odelzaThemeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding-block: ${({ isMobile }) =>
    isMobile ? '0' : odelzaThemeCssVariables.spacing[3]};
  padding-inline: ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledInputBox = styled.div`
  background-color: ${odelzaThemeCssVariables.background.transparent.lighter};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  min-height: 140px;
  padding: ${odelzaThemeCssVariables.spacing[2]};
  width: 100%;

  &:focus-within {
    border-color: ${odelzaThemeCssVariables.color.primary};
    box-shadow: 0px 0px 0px 3px
      ${odelzaThemeCssVariables.color.transparent.primary2};
  }
`;

const StyledEditorWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  .tiptap {
    background: transparent;
    border: none;
    box-shadow: none;
    color: ${odelzaThemeCssVariables.font.color.primary};
    font-family: inherit;
    font-size: ${odelzaThemeCssVariables.font.size.md};
    font-weight: ${odelzaThemeCssVariables.font.weight.regular};
    line-height: 16px;
    max-height: 320px;
    min-height: 48px;
    outline: none;
    overflow-y: auto;
    padding: 0;

    p {
      margin: 0;
    }

    p.is-editor-empty:first-of-type::before {
      color: ${odelzaThemeCssVariables.font.color.light};
      content: attr(data-placeholder);
      float: left;
      font-weight: ${odelzaThemeCssVariables.font.weight.regular};
      height: 0;
      pointer-events: none;
    }
  }
`;

const StyledButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledLeftButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing['0.5']};
`;

const StyledRightButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

export const AiChatEditorSection = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const hasReachedCurrentBillingPeriodCap = useAtomStateValue(
    hasReachedCurrentBillingPeriodCapSelector,
  );
  const { enabledModels } = useWorkspaceAiModelAvailability();
  const hasNoEnabledModels = enabledModels.length === 0;
  const { options, pinnedOption } = useAiModelOptions({
    variant: 'pinned-default',
  });

  const smartModelOptions: SelectOption<string | null>[] = options;
  const defaultPinnedOption: SelectOption<string | null> | undefined =
    pinnedOption
      ? {
          ...pinnedOption,
          value: null,
        }
      : undefined;
  const setAgentChatUserSelectedModel = useSetAtomState(
    agentChatUserSelectedModelState,
  );
  const { selectedModelId } = useAgentChatModelId();

  const { editor, handleSendAndClear } = useAiChatEditor();

  const pendingQuestion = useAtomComponentSelectorValue(
    agentChatPendingQuestionComponentSelector,
  );

  return (
    <>
      <AiChatEditorFocusEffect editor={editor} />
      <AiChatEmptyState editor={editor} />
      <AiChatStandaloneError />
      <AiChatSkeletonLoader />

      <StyledInputArea isMobile={isMobile}>
        <AgentChatContextPreview />
        {hasNoEnabledModels && (
          <AiChatBanner
            message={t`No AI models are enabled in this workspace.`}
            variant="warning"
          />
        )}
        {hasReachedCurrentBillingPeriodCap && (
          <AIChatNoMoreBillingCreditsBanner />
        )}
        {isDefined(pendingQuestion) ? (
          <AiChatQuestionCard pendingQuestion={pendingQuestion} />
        ) : (
          <StyledInputBox>
            <StyledEditorWrapper>
              <EditorContent editor={editor} />
            </StyledEditorWrapper>
            <StyledButtonsContainer>
              <StyledLeftButtonsContainer>
                <AgentChatFileUploadButton />
                <AiChatContextUsageButton />
              </StyledLeftButtonsContainer>
              <StyledRightButtonsContainer>
                <Select
                  dropdownId="ai-chat-smart-model-select"
                  value={selectedModelId}
                  onChange={setAgentChatUserSelectedModel}
                  options={smartModelOptions}
                  pinnedOption={defaultPinnedOption}
                  disabled={hasNoEnabledModels}
                  selectSizeVariant="small"
                  showContextualTextInControl={false}
                  withSearchInput
                  dropdownOffset={{ x: 0, y: 8 }}
                />
                <SendMessageButton
                  onSend={handleSendAndClear}
                  isDisabled={hasNoEnabledModels}
                />
              </StyledRightButtonsContainer>
            </StyledButtonsContainer>
          </StyledInputBox>
        )}
      </StyledInputArea>
    </>
  );
};
