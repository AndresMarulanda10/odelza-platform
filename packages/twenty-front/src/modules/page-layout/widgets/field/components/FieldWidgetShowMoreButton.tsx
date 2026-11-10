import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { IconChevronDown } from 'twenty-ui/icon';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type FieldWidgetShowMoreButtonProps = {
  remainingCount: number;
  onClick: () => void;
};

const StyledButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  box-sizing: border-box;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-family: ${odelzaThemeCssVariables.font.family};
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: 24px;
  padding: 0;
  transition: color ${odelzaThemeCssVariables.animation.duration.instant}s ease;
  width: 100%;

  &:hover {
    color: ${odelzaThemeCssVariables.font.color.primary};
  }
`;

const StyledIconContainer = styled.span`
  display: flex;
  height: 16px;
  width: 16px;
`;

export const FieldWidgetShowMoreButton = ({
  remainingCount,
  onClick,
}: FieldWidgetShowMoreButtonProps) => {
  return (
    <StyledButton data-testid="field-widget-show-more-button" onClick={onClick}>
      <StyledIconContainer>
        <IconChevronDown />
      </StyledIconContainer>
      {t`More (${remainingCount})`}
    </StyledButton>
  );
};
