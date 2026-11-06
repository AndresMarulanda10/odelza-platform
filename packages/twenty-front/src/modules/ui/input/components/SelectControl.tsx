import { type SelectSizeVariant } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { TintedIconTile } from 'twenty-ui/data-display';
import { IconChevronDown } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { type SelectOption } from 'twenty-ui/input';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

export type SelectControlTextAccent = 'default' | 'placeholder';

// TODO: factorize this with https://github.com/twentyhq/core-team-issues/issues/752
export const StyledControlContainer = styled.div<{
  disabled?: boolean;
  hasIcon: boolean;
  selectSizeVariant?: SelectSizeVariant;
  textAccent: SelectControlTextAccent;
  hasRightElement?: boolean;
}>`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.transparent.lighter};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-bottom-left-radius: ${odelzaThemeCssVariables.border.radius.md};
  border-bottom-right-radius: ${({ hasRightElement }) =>
    hasRightElement ? '0' : odelzaThemeCssVariables.border.radius.md};
  border-right: ${({ hasRightElement }) =>
    hasRightElement
      ? 'none'
      : `1px solid ${odelzaThemeCssVariables.border.color.medium}`};
  border-top-left-radius: ${odelzaThemeCssVariables.border.radius.md};
  border-top-right-radius: ${({ hasRightElement }) =>
    hasRightElement ? '0' : odelzaThemeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${({ disabled, textAccent }) =>
    disabled
      ? odelzaThemeCssVariables.font.color.tertiary
      : textAccent === 'default'
        ? odelzaThemeCssVariables.font.color.primary
        : odelzaThemeCssVariables.font.color.tertiary};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: grid;

  gap: ${odelzaThemeCssVariables.spacing[1]};
  grid-template-columns: ${({ hasIcon }) =>
    hasIcon ? 'auto 1fr auto' : '1fr auto'};
  height: ${({ selectSizeVariant }) =>
    selectSizeVariant === 'small'
      ? odelzaThemeCssVariables.spacing[6]
      : odelzaThemeCssVariables.spacing[8]};

  max-width: 100%;
  padding: 0 ${odelzaThemeCssVariables.spacing[2]};
  text-align: left;
`;

const StyledIconChevronDownWrapper = styled.div<{
  disabled?: boolean;
}>`
  color: ${({ disabled }) =>
    disabled
      ? odelzaThemeCssVariables.font.color.extraLight
      : odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
`;

export type SelectControlProps = {
  selectedOption: SelectOption<string | number | boolean | null>;
  isDisabled?: boolean;
  selectSizeVariant?: SelectSizeVariant;
  textAccent?: SelectControlTextAccent;
  hasRightElement?: boolean;
};

export const SelectControl = ({
  selectedOption,
  isDisabled,
  selectSizeVariant,
  textAccent = 'default',
  hasRightElement,
}: SelectControlProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledControlContainer
      disabled={isDisabled}
      hasIcon={isDefined(selectedOption?.Icon)}
      selectSizeVariant={selectSizeVariant}
      textAccent={textAccent}
      hasRightElement={hasRightElement}
      title={selectedOption.fullLabel}
    >
      {isDefined(selectedOption?.Icon) ? (
        isDefined(selectedOption.iconThemeColor) ? (
          <TintedIconTile
            Icon={selectedOption.Icon}
            color={selectedOption.iconThemeColor}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        ) : (
          <selectedOption.Icon
            color={
              isDisabled ? theme.font.color.light : theme.font.color.primary
            }
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )
      ) : null}
      <OverflowingTextWithTooltip
        text={
          selectedOption.contextualText
            ? `${selectedOption.label} · ${selectedOption.contextualText}`
            : selectedOption.label
        }
      />
      <StyledIconChevronDownWrapper disabled={isDisabled}>
        <IconChevronDown size={theme.icon.size.md} />
      </StyledIconChevronDownWrapper>
    </StyledControlContainer>
  );
};
