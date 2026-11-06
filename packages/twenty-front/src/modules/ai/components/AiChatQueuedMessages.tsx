import { styled } from '@linaria/react';

import { agentChatQueuedMessagesComponentFamilyState } from '@/ai/states/agentChatQueuedMessagesComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useDeleteQueuedMessage } from '@/ai/hooks/useDeleteQueuedMessage';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { IconX } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledQueueContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  padding: 0 ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledQueueLabel = styled.div`
  color: ${odelzaThemeCssVariables.font.color.light};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  padding-left: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledQueuedItem = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.tertiary};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  color: ${odelzaThemeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.md};
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${odelzaThemeCssVariables.spacing[1]}
    ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledQueuedText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AiChatQueuedMessages = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatQueuedMessages = useAtomComponentFamilyStateValue(
    agentChatQueuedMessagesComponentFamilyState,
    { threadId: currentAiChatThread },
  );
  const { deleteQueuedMessage } = useDeleteQueuedMessage();

  if (!isDefined(currentAiChatThread) || agentChatQueuedMessages.length === 0) {
    return null;
  }

  return (
    <StyledQueueContainer>
      <StyledQueueLabel>
        {agentChatQueuedMessages.length} Queued
      </StyledQueueLabel>
      {agentChatQueuedMessages.map((message) => {
        const textPart = message.parts?.find((part) => part.type === 'text');
        const displayText = textPart && 'text' in textPart ? textPart.text : '';

        return (
          <StyledQueuedItem key={message.id}>
            <StyledQueuedText>{displayText}</StyledQueuedText>
            <LightIconButton
              Icon={IconX}
              onClick={() => deleteQueuedMessage(message.id)}
              size="small"
            />
          </StyledQueuedItem>
        );
      })}
    </StyledQueueContainer>
  );
};
