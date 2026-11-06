import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Card } from 'twenty-ui/surfaces';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import {
  AgentMessageRole,
  type GetAdminChatThreadMessagesQuery,
} from '~/generated-admin/graphql';

type ChatMessage = NonNullable<
  GetAdminChatThreadMessagesQuery['getAdminChatThreadMessages']
>['messages'][number];

type SettingsAdminChatThreadMessageListProps = {
  messages: ChatMessage[];
};

const StyledMessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[4]};
`;

const StyledMessageBubble = styled.div<{ isUser?: boolean }>`
  align-items: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledMessageContent = styled.div<{ isUser?: boolean }>`
  background: ${({ isUser }) =>
    isUser ? odelzaThemeCssVariables.background.tertiary : 'transparent'};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  color: ${({ isUser }) =>
    isUser
      ? odelzaThemeCssVariables.font.color.secondary
      : odelzaThemeCssVariables.font.color.primary};
  font-weight: ${({ isUser }) => (isUser ? 500 : 400)};
  line-height: 1.4em;
  max-width: 100%;
  overflow-wrap: break-word;
  padding: ${({ isUser }) =>
    isUser ? `0 ${odelzaThemeCssVariables.spacing[2]}` : '0'};
  white-space: ${({ isUser }) => (isUser ? 'pre-wrap' : 'normal')};
  width: ${({ isUser }) => (isUser ? 'fit-content' : '100%')};
`;

const StyledRoleLabel = styled.span`
  color: ${odelzaThemeCssVariables.font.color.light};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  margin-bottom: ${odelzaThemeCssVariables.spacing[1]};
  text-transform: capitalize;
`;

const StyledTimestamp = styled.span`
  color: ${odelzaThemeCssVariables.font.color.light};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  margin-top: ${odelzaThemeCssVariables.spacing[1]};
`;

export const SettingsAdminChatThreadMessageList = ({
  messages,
}: SettingsAdminChatThreadMessageListProps) => {
  const visibleMessages = messages.filter(
    (message) => message.role !== AgentMessageRole.SYSTEM,
  );

  if (visibleMessages.length === 0) {
    return (
      <Card rounded>
        <TableRow gridTemplateColumns="1fr">
          <TableCell
            color={odelzaThemeCssVariables.font.color.tertiary}
            align="center"
          >
            {t`No messages found.`}
          </TableCell>
        </TableRow>
      </Card>
    );
  }

  return (
    <StyledMessagesContainer>
      {visibleMessages.map((message) => {
        const isUser = message.role === AgentMessageRole.USER;
        const textParts = message.parts
          .filter((part) => part.type === 'text' && part.textContent !== null)
          .map((part) => part.textContent)
          .join('\n');

        const toolParts = message.parts.filter(
          (part) => part.type === 'tool-call' && part.toolName !== null,
        );

        if (textParts.length === 0 && toolParts.length === 0) {
          return null;
        }

        return (
          <StyledMessageBubble key={message.id} isUser={isUser}>
            <StyledRoleLabel>{message.role}</StyledRoleLabel>
            {textParts.length > 0 && (
              <StyledMessageContent isUser={isUser}>
                {isUser ? textParts : <LazyMarkdownRenderer text={textParts} />}
              </StyledMessageContent>
            )}
            {toolParts.map((part, index) => (
              <StyledMessageContent key={index} isUser={false}>
                {t`Tool call: ${part.toolName ?? ''}`}
              </StyledMessageContent>
            ))}
            <StyledTimestamp>
              {new Date(message.createdAt).toLocaleString()}
            </StyledTimestamp>
          </StyledMessageBubble>
        );
      })}
    </StyledMessagesContainer>
  );
};
