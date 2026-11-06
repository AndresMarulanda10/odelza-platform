import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconLock } from 'twenty-ui/icon';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';
import { MessageChannelVisibility } from '~/generated/graphql';

const StyledContainer = styled.div<{ isCompact?: boolean }>`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.transparent.lighter};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  flex: ${({ isCompact }) => (isCompact ? '0 0 auto' : '1 0 0')};
  font-size: ${odelzaThemeCssVariables.font.size.sm};

  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: 20px;

  margin-left: auto;
  min-width: ${odelzaThemeCssVariables.spacing[21]};
  padding: ${odelzaThemeCssVariables.spacing[0]}
    ${odelzaThemeCssVariables.spacing[1]};
  width: ${({ isCompact }) => (isCompact ? 'auto' : '100%')};
`;

type EmailThreadNotSharedProps = {
  visibility: MessageChannelVisibility;
};

export const EmailThreadNotShared = ({
  visibility,
}: EmailThreadNotSharedProps) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const containerId = 'email-thread-not-shared';
  const isCompact = visibility === MessageChannelVisibility.SUBJECT;

  return (
    <>
      <StyledContainer id={containerId} isCompact={isCompact}>
        <IconLock size={theme.icon.size.sm} />
        {t`Not shared`}
      </StyledContainer>
      {visibility === MessageChannelVisibility.SUBJECT && (
        <AppTooltip
          anchorSelect={`#${containerId}`}
          content={t`Only the subject is shared`}
          delay={TooltipDelay.mediumDelay}
          noArrow
          place="bottom"
          positionStrategy="fixed"
        />
      )}
    </>
  );
};
