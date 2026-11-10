import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { type McpSetupCard } from '@/settings/mcp-and-apis/types/McpSetup';
import { Pill } from 'twenty-ui/data-display';
import { IconExternalLink } from 'twenty-ui/icon';
import {
  AppTooltip,
  Card,
  CardContent,
  TooltipDelay,
} from 'twenty-ui/surfaces';
import { odelzaThemeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledCardContent = styled(CardContent)`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[4]};
  min-width: 0;
  padding: ${odelzaThemeCssVariables.spacing[3]}
    ${odelzaThemeCssVariables.spacing[3]} ${odelzaThemeCssVariables.spacing[3]}
    ${odelzaThemeCssVariables.spacing[4]};
`;

const StyledLogo = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.primary};
  display: flex;
  flex: 0 0 ${odelzaThemeCssVariables.spacing[8]};
  height: ${odelzaThemeCssVariables.spacing[8]};
  justify-content: center;
  width: ${odelzaThemeCssVariables.spacing[8]};
`;

const StyledBody = styled.div`
  align-self: stretch;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledTitle = styled.div`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledActionSlot = styled.div`
  display: flex;
  flex: 0 0 auto;
  margin-left: auto;
`;

const StyledDescription = styled.div`
  color: ${odelzaThemeCssVariables.font.color.secondary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
`;

// Install links use custom URI schemes (goose://, vscode:, lmstudio://) that
// twenty-ui Button/RawLink/RoundedLink strip through react-router or getSafeUrl,
// so the call to action has to stay a raw anchor with the untouched href.
const StyledInstallAction = styled.a`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.transparent.lighter};
  border: 1px solid ${odelzaThemeCssVariables.background.transparent.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${odelzaThemeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: ${odelzaThemeCssVariables.spacing[6]};
  padding: 0 ${odelzaThemeCssVariables.spacing[2]};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background: ${odelzaThemeCssVariables.background.transparent.light};
  }

  &[aria-disabled='true'] {
    color: ${odelzaThemeCssVariables.font.color.light};
    cursor: not-allowed;
  }
`;

type SettingsMcpSetupCardActionProps = {
  card: McpSetupCard;
};

const SettingsMcpSetupCardAction = ({
  card,
}: SettingsMcpSetupCardActionProps) => {
  const theme = useTheme();

  if (card.isDisabled === true) {
    return (
      <>
        <StyledInstallAction
          as="span"
          aria-disabled="true"
          data-tooltip-id={card.tooltipId}
        >
          <IconExternalLink size={theme.icon.size.sm} />
          {card.ctaLabel}
        </StyledInstallAction>
        {isDefined(card.disabledTooltip) && isDefined(card.tooltipId) && (
          <AppTooltip
            anchorSelect={`[data-tooltip-id='${card.tooltipId}']`}
            content={card.disabledTooltip}
            delay={TooltipDelay.shortDelay}
            noArrow
            place="bottom"
            positionStrategy="fixed"
          />
        )}
      </>
    );
  }

  if (!isDefined(card.href)) {
    return null;
  }

  return (
    <StyledInstallAction
      href={card.href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <IconExternalLink size={theme.icon.size.sm} />
      {card.ctaLabel}
    </StyledInstallAction>
  );
};

type SettingsMcpSetupCardProps = {
  card: McpSetupCard;
};

export const SettingsMcpSetupCard = ({ card }: SettingsMcpSetupCardProps) => (
  <Card rounded>
    <StyledCardContent>
      <StyledLogo aria-hidden>{card.logo}</StyledLogo>
      <StyledBody>
        <StyledHeader>
          <StyledTitle>{card.title}</StyledTitle>
          <Pill label={card.badge} />
          <StyledActionSlot>
            <SettingsMcpSetupCardAction card={card} />
          </StyledActionSlot>
        </StyledHeader>
        <StyledDescription>{card.description}</StyledDescription>
      </StyledBody>
    </StyledCardContent>
  </Card>
);
