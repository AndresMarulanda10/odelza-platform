import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconAlertCircle, IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatError } from '@/ai/types/AiChatError';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

const StyledErrorContainer = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.danger};
  border: 1px solid ${odelzaThemeCssVariables.border.color.danger};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding: ${odelzaThemeCssVariables.spacing[2]}
    ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledErrorIcon = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.color.red};
  display: flex;
`;

const StyledErrorContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing['0.5']};
`;

const StyledErrorTitle = styled.div`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

const StyledErrorMessage = styled.div`
  color: ${odelzaThemeCssVariables.font.color.secondary};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  word-break: break-word;
`;

type AiChatErrorMessageProps = {
  error: AiChatError;
  onRetry?: () => void;
};

export const AiChatErrorMessage = ({
  error,
  onRetry,
}: AiChatErrorMessageProps) => {
  const { theme } = useContext(ThemeContext);
  const errorMessage = CombinedGraphQLErrors.is(error)
    ? getErrorMessageFromApolloError(error)
    : error.message;

  return (
    <StyledErrorContainer>
      <StyledErrorIcon>
        <IconAlertCircle size={theme.icon.size.md} />
      </StyledErrorIcon>
      <StyledErrorContent>
        <StyledErrorTitle>{t`Failed to get response`}</StyledErrorTitle>
        <StyledErrorMessage>
          {errorMessage || t`An error occurred while processing your message`}
        </StyledErrorMessage>
      </StyledErrorContent>
      {isDefined(onRetry) && (
        <Button
          variant="secondary"
          size="small"
          Icon={IconRefresh}
          onClick={onRetry}
          title={t`Retry`}
        />
      )}
    </StyledErrorContainer>
  );
};
