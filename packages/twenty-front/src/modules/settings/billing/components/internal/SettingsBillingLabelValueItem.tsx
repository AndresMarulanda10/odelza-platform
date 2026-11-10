import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { IconInfoCircle } from 'twenty-ui/icon';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type SettingsBillingLabelValueItemProps = {
  label: string;
  value: ReactNode;
  isValueInPrimaryColor?: boolean;
  tooltipText?: string;
  tooltipId?: string;
};

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledLabelWrapper = styled.span`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledLabelSpan = styled.span`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
`;

const StyledInfoIcon = styled(IconInfoCircle)`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  cursor: default;
  flex-shrink: 0;
`;

const StyledValueSpan = styled.span<{ isPrimaryColor: boolean }>`
  color: ${({ isPrimaryColor }) =>
    isPrimaryColor
      ? odelzaThemeCssVariables.font.color.primary
      : odelzaThemeCssVariables.font.color.secondary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

export const SettingsBillingLabelValueItem = ({
  label,
  value,
  isValueInPrimaryColor = false,
  tooltipText,
  tooltipId,
}: SettingsBillingLabelValueItemProps) => {
  return (
    <StyledContainer>
      <StyledLabelWrapper>
        <StyledLabelSpan>{label}</StyledLabelSpan>
        {tooltipText && tooltipId && (
          <>
            <StyledInfoIcon id={tooltipId} size={12} />
            <AppTooltip
              anchorSelect={`#${tooltipId}`}
              content={tooltipText}
              noArrow={false}
              place="top"
              delay={TooltipDelay.shortDelay}
              positionStrategy="fixed"
            />
          </>
        )}
      </StyledLabelWrapper>
      <StyledValueSpan isPrimaryColor={isValueInPrimaryColor}>
        {value}
      </StyledValueSpan>
    </StyledContainer>
  );
};
