import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledPageTitle = styled.div`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
`;

export const SidePanelAskAiInfo = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const currentAiChatThreadTitle = useAtomComponentFamilyStateValue(
    currentAiChatThreadTitleComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  return (
    <StyledPageTitle>
      <OverflowingTextWithTooltip
        text={currentAiChatThreadTitle ?? t`Ask AI`}
      />
    </StyledPageTitle>
  );
};
