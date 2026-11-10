import { styled } from '@linaria/react';

import { type ReactNode, useContext } from 'react';
import { t } from '@lingui/core/macro';
import { Card, CardContent } from 'twenty-ui/surfaces';
import { IconChevronRight } from 'twenty-ui/icon';
import { Pill } from 'twenty-ui/data-display';
import { isDefined } from 'twenty-shared/utils';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

type SettingsCardProps = {
  description?: string;
  disabled?: boolean;
  soon?: boolean;
  Icon: ReactNode;
  iconColor?: string;
  onClick?: () => void;
  title: string;
  className?: string;
  Status?: ReactNode;
};

const StyledCardWrapper = styled.div<{
  disabled?: boolean;
  clickable?: boolean;
}>`
  color: ${({ disabled }) =>
    disabled
      ? odelzaThemeCssVariables.font.color.extraLight
      : odelzaThemeCssVariables.font.color.tertiary};
  cursor: ${({ disabled, clickable }) =>
    disabled ? 'not-allowed' : clickable ? 'pointer' : 'default'};
  width: 100%;

  > * {
    color: inherit;
  }
`;

const StyledCardContentContainer = styled.div`
  > * {
    display: flex;
    flex-direction: column;
    gap: ${odelzaThemeCssVariables.spacing[2]};
    padding: ${odelzaThemeCssVariables.spacing[2]}
      ${odelzaThemeCssVariables.spacing[2]};

    &:hover {
      background-color: ${odelzaThemeCssVariables.background.quaternary};
      cursor: pointer;
    }
  }
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledTitle = styled.div<{ disabled?: boolean }>`
  color: ${({ disabled }) =>
    disabled
      ? odelzaThemeCssVariables.font.color.extraLight
      : odelzaThemeCssVariables.font.color.secondary};
  display: flex;
  flex: 1 0 auto;
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: flex-start;
`;

const StyledIconChevronRightContainer = styled.span`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.light};
  display: flex;
`;

const StyledDescription = styled.div`
  line-height: ${odelzaThemeCssVariables.text.lineHeight.lg};
  padding-bottom: ${odelzaThemeCssVariables.spacing[2]};
  padding-left: ${odelzaThemeCssVariables.spacing[7]};
`;

const StyledIconContainer = styled.div<{
  disabled?: boolean;
  iconColor?: string;
}>`
  align-items: center;
  color: ${({ disabled, iconColor }) =>
    disabled
      ? odelzaThemeCssVariables.font.color.extraLight
      : (iconColor ?? 'inherit')};
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

export const SettingsCard = ({
  description,
  soon,
  disabled = soon,
  Icon,
  iconColor,
  onClick,
  title,
  className,
  Status,
}: SettingsCardProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledCardWrapper
      disabled={disabled}
      clickable={!!onClick}
      className={className}
    >
      <Card onClick={disabled ? undefined : onClick} rounded={true} fullWidth>
        <StyledCardContentContainer>
          <CardContent>
            <StyledHeader>
              <StyledIconContainer disabled={disabled} iconColor={iconColor}>
                {Icon}
              </StyledIconContainer>
              <StyledTitle disabled={disabled}>
                {title}
                {soon && <Pill label={t`Soon`} />}
              </StyledTitle>
              {isDefined(Status) && Status}
              <StyledIconChevronRightContainer>
                <IconChevronRight size={theme.icon.size.sm} />
              </StyledIconChevronRightContainer>
            </StyledHeader>
            {description && (
              <StyledDescription>{description}</StyledDescription>
            )}
          </CardContent>
        </StyledCardContentContainer>
      </Card>
    </StyledCardWrapper>
  );
};
