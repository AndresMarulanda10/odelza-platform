import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { ProgressBar } from 'twenty-ui/feedback';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { ContextUsageProgressRing } from '@/ai/components/internal/ContextUsageProgressRing';
import { agentChatHasMessageComponentSelector } from '@/ai/states/selectors/agentChatHasMessageComponentSelector';
import {
  agentChatUsageComponentFamilyState,
  type AgentChatLastMessageUsage,
} from '@/ai/states/agentChatUsageComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { billingState } from '@/client-config/states/billingState';
import { SettingsBillingLabelValueItem } from '@/settings/billing/components/internal/SettingsBillingLabelValueItem';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledContainer = styled.div`
  position: relative;
`;

const StyledTrigger = styled.div<{ hasUsage: boolean }>`
  align-items: center;
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  cursor: ${({ hasUsage }) => (hasUsage ? 'pointer' : 'default')};
  display: flex;
  height: 24px;
  justify-content: center;
  min-width: 24px;
  transition: background
    calc(${odelzaThemeCssVariables.animation.duration.fast} * 1s) ease;

  &:hover {
    background: ${({ hasUsage }) =>
      hasUsage
        ? odelzaThemeCssVariables.background.transparent.light
        : 'transparent'};
  }
`;

const StyledHoverCard = styled.div`
  background: ${odelzaThemeCssVariables.background.primary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  bottom: calc(100% + 8px);
  box-shadow: ${odelzaThemeCssVariables.boxShadow.strong};
  left: 0;
  min-width: 280px;
  position: absolute;
  z-index: ${odelzaThemeCssVariables.lastLayerZIndex};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding: ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledContextWindowValue = styled.span`
  color: ${odelzaThemeCssVariables.font.color.secondary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

const StyledSectionTitle = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  padding-bottom: ${odelzaThemeCssVariables.spacing[2]};
`;

const getCachedLabel = (lastMessage: AgentChatLastMessageUsage): string => {
  if (lastMessage.cachedInputTokens <= 0 || lastMessage.inputTokens <= 0) {
    return '';
  }

  const cachedPercent = Math.round(
    (lastMessage.cachedInputTokens / lastMessage.inputTokens) * 100,
  );

  return ` (${t`${cachedPercent}% cached`})`;
};

export const AiChatContextUsageButton = () => {
  const { t } = useLingui();
  const [isHovered, setIsHovered] = useState(false);
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatUsage = useAtomComponentFamilyStateValue(
    agentChatUsageComponentFamilyState,
    { threadId: currentAiChatThread },
  );
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const { formatUsageValue } = useUsageValueFormatter();

  // Values from the streaming API arrive as display credits (micro-credits).
  const formatChatCost = (displayCredits: number): string => {
    if (isBillingEnabled) {
      return `${formatUsageValue(displayCredits)}`;
    }
    const dollars = displayCredits / 1000;

    return `$${formatNumber(dollars, { decimals: 2 })}`;
  };

  const hasMessages = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

  if (!hasMessages) {
    return null;
  }

  if (!agentChatUsage) {
    return (
      <StyledContainer>
        <StyledTrigger hasUsage={false}>
          <ContextUsageProgressRing percentage={0} />
        </StyledTrigger>
      </StyledContainer>
    );
  }

  const percentage = Math.min(
    (agentChatUsage.conversationSize / agentChatUsage.contextWindowTokens) *
      100,
    100,
  );
  const formattedPercentage = percentage.toFixed(1);
  const totalCredits =
    agentChatUsage.inputCredits + agentChatUsage.outputCredits;
  const lastMessage = agentChatUsage.lastMessage;

  return (
    <StyledContainer
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <StyledTrigger hasUsage={true}>
        <ContextUsageProgressRing percentage={percentage} />
      </StyledTrigger>

      {isHovered && (
        <StyledHoverCard>
          <StyledSection>
            <StyledSectionTitle>{t`Context window`}</StyledSectionTitle>
            <StyledRow>
              <StyledContextWindowValue>
                {formattedPercentage}%
              </StyledContextWindowValue>
              <StyledContextWindowValue>
                {formatNumber(agentChatUsage.conversationSize, {
                  abbreviate: true,
                  decimals: 1,
                })}{' '}
                /{' '}
                {formatNumber(agentChatUsage.contextWindowTokens, {
                  abbreviate: true,
                  decimals: 1,
                })}{' '}
                {t`tokens`}
              </StyledContextWindowValue>
            </StyledRow>
            <ProgressBar
              value={percentage}
              barColor={
                percentage > 80
                  ? odelzaThemeCssVariables.color.red
                  : percentage > 60
                    ? odelzaThemeCssVariables.color.orange
                    : odelzaThemeCssVariables.color.primary
              }
              backgroundColor={odelzaThemeCssVariables.background.tertiary}
              withBorderRadius
            />
          </StyledSection>

          {isDefined(lastMessage) && (
            <>
              <HorizontalSeparator
                noMargin
                color={odelzaThemeCssVariables.background.tertiary}
              />
              <StyledSection>
                <StyledSectionTitle>{t`Last message`}</StyledSectionTitle>
                <SettingsBillingLabelValueItem
                  label={t`Input tokens`}
                  value={`${formatNumber(lastMessage.inputTokens, {
                    abbreviate: true,
                    decimals: 1,
                  })}${getCachedLabel(lastMessage)}`}
                />
                <SettingsBillingLabelValueItem
                  label={t`Output tokens`}
                  value={formatNumber(lastMessage.outputTokens, {
                    abbreviate: true,
                    decimals: 1,
                  })}
                />
                <SettingsBillingLabelValueItem
                  label={t`Cost`}
                  value={formatChatCost(
                    lastMessage.inputCredits + lastMessage.outputCredits,
                  )}
                />
              </StyledSection>
            </>
          )}

          <HorizontalSeparator
            noMargin
            color={odelzaThemeCssVariables.background.tertiary}
          />
          <StyledSection>
            <StyledSectionTitle>{t`Conversation`}</StyledSectionTitle>
            <SettingsBillingLabelValueItem
              label={t`Input tokens`}
              value={formatNumber(agentChatUsage.inputTokens, {
                abbreviate: true,
                decimals: 1,
              })}
            />
            <SettingsBillingLabelValueItem
              label={t`Output tokens`}
              value={formatNumber(agentChatUsage.outputTokens, {
                abbreviate: true,
                decimals: 1,
              })}
            />
            <SettingsBillingLabelValueItem
              label={t`Total cost`}
              value={formatChatCost(totalCredits)}
            />
          </StyledSection>
        </StyledHoverCard>
      )}
    </StyledContainer>
  );
};
