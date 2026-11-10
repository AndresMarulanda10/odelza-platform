import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Fragment } from 'react/jsx-runtime';
import { type SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledChip = styled.button<{
  withText: boolean;
  maxWidth?: string;
  onClick?: () => void;
}>`
  align-items: center;
  all: unset;
  background: ${odelzaThemeCssVariables.background.transparent.light};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${odelzaThemeCssVariables.font.color.primary};
  cursor: ${({ onClick }) => (isDefined(onClick) ? 'pointer' : 'default')};
  display: flex;
  font-family: inherit;
  /* If the chip has text, we add extra padding to have a more balanced design */
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: ${odelzaThemeCssVariables.spacing[6]};
  justify-content: center;
  line-height: ${odelzaThemeCssVariables.text.lineHeight.lg};
  max-width: ${({ maxWidth }) => maxWidth ?? ''};

  &:hover {
    background: ${({ onClick }) =>
      isDefined(onClick)
        ? odelzaThemeCssVariables.background.transparent.medium
        : odelzaThemeCssVariables.background.transparent.light};
  }
  padding: 0
    ${({ withText }) =>
      withText
        ? odelzaThemeCssVariables.spacing[2]
        : odelzaThemeCssVariables.spacing[1]};
`;

const StyledIconsContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledEmptyText = styled.div`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
`;

export type SidePanelContextChipProps = {
  Icons: React.ReactNode[];
  text?: string;
  onClick?: () => void;
  testId?: string;
  maxWidth?: string;
  forceEmptyText?: boolean;
  page?: {
    page: SidePanelPages;
    pageId: string;
  };
};

export const SidePanelContextChip = ({
  Icons,
  text,
  onClick,
  testId,
  maxWidth,
  forceEmptyText = false,
}: SidePanelContextChipProps) => {
  return (
    <StyledChip
      withText={isNonEmptyString(text)}
      onClick={onClick}
      data-testid={testId}
      maxWidth={maxWidth}
    >
      <StyledIconsContainer>
        {Icons.map((Icon, index) => (
          <Fragment key={index}>{Icon}</Fragment>
        ))}
      </StyledIconsContainer>
      {text?.trim?.() ? (
        <OverflowingTextWithTooltip text={text} />
      ) : !forceEmptyText ? (
        <StyledEmptyText>{t`Untitled`}</StyledEmptyText>
      ) : (
        ''
      )}
    </StyledChip>
  );
};
