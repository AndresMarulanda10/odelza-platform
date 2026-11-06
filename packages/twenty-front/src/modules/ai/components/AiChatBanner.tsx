import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconAlertTriangle,
  IconInfoCircle,
} from 'twenty-ui/icon';
import { AppTooltip } from 'twenty-ui/surfaces';
import { Button } from 'twenty-ui/input';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type AiChatBannerVariant = 'default' | 'warning';

const StyledBanner = styled.div<{ variant: AiChatBannerVariant }>`
  align-items: center;
  background-color: ${({ variant }) =>
    variant === 'warning'
      ? odelzaThemeCssVariables.background.transparent.orange
      : odelzaThemeCssVariables.accent.secondary};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding: ${odelzaThemeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledIconContainer = styled.div<{ variant: AiChatBannerVariant }>`
  align-items: center;
  color: ${({ variant }) =>
    variant === 'warning'
      ? odelzaThemeCssVariables.color.orange
      : odelzaThemeCssVariables.color.primary};
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const StyledMessage = styled.p<{ variant: AiChatBannerVariant }>`
  color: ${({ variant }) =>
    variant === 'warning'
      ? odelzaThemeCssVariables.color.orange
      : odelzaThemeCssVariables.color.primary};
  flex-grow: 1;
  font-family: ${odelzaThemeCssVariables.font.family};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-style: normal;
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  line-height: 1.4;
  margin: 0;
  min-width: 0;
  white-space: pre-line;
`;

export type AiChatBannerProps = {
  message: string;
  variant?: AiChatBannerVariant;
  tooltipMessage?: string;
  buttonTitle?: string;
  buttonIcon?: IconComponent;
  buttonOnClick?: () => void;
  isButtonDisabled?: boolean;
  isButtonLoading?: boolean;
};

export const AiChatBanner = ({
  message,
  variant = 'default',
  tooltipMessage,
  buttonTitle,
  buttonIcon,
  buttonOnClick,
  isButtonDisabled = false,
  isButtonLoading = false,
}: AiChatBannerProps) => {
  const tooltipId = 'ai-chat-banner-tooltip';

  return (
    <StyledBanner
      variant={variant}
      data-tooltip-id={tooltipMessage ? tooltipId : undefined}
    >
      <StyledIconContainer variant={variant}>
        {variant === 'default' ? (
          <IconInfoCircle size={16} />
        ) : (
          <IconAlertTriangle size={16} />
        )}
      </StyledIconContainer>
      <StyledMessage variant={variant}>{message}</StyledMessage>
      {isDefined(buttonTitle) && isDefined(buttonOnClick) && (
        <Button
          variant="secondary"
          size="small"
          Icon={buttonIcon}
          onClick={buttonOnClick}
          disabled={isButtonDisabled || isButtonLoading}
          title={buttonTitle}
        />
      )}
      {isDefined(tooltipMessage) && (
        <AppTooltip
          anchorSelect={`[data-tooltip-id='${tooltipId}']`}
          content={tooltipMessage}
          place="bottom"
        />
      )}
    </StyledBanner>
  );
};
