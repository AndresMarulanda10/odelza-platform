import { styled } from '@linaria/react';
import { type MouseEvent, type ReactNode, useContext } from 'react';
import { IconX } from 'twenty-ui/icon';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledChip = styled.div<{
  deletable: boolean;
  danger: boolean;
  selected: boolean;
}>`
  align-items: center;
  background-color: ${({ danger, selected }) =>
    selected
      ? danger
        ? odelzaThemeCssVariables.color.red
        : odelzaThemeCssVariables.color.primary
      : danger
        ? odelzaThemeCssVariables.color.red3
        : odelzaThemeCssVariables.color.primary3};
  border-color: ${({ danger, selected }) =>
    selected
      ? danger
        ? odelzaThemeCssVariables.color.red
        : odelzaThemeCssVariables.color.primary
      : danger
        ? odelzaThemeCssVariables.color.red5
        : odelzaThemeCssVariables.color.primary5};
  border-radius: ${odelzaThemeCssVariables.border.radius.smRound};
  border-style: solid;
  border-width: 1px;
  box-sizing: border-box;
  color: ${({ danger, selected }) =>
    selected
      ? odelzaThemeCssVariables.font.color.inverted
      : danger
        ? odelzaThemeCssVariables.color.red
        : odelzaThemeCssVariables.color.primary};
  column-gap: ${odelzaThemeCssVariables.spacing[1]};
  corner-shape: round;
  cursor: ${({ deletable }) => (deletable ? 'pointer' : 'default')};
  display: inline-flex;
  flex-direction: row;
  flex-shrink: 0;
  height: 20px;
  max-width: 100%;
  padding-left: ${odelzaThemeCssVariables.spacing[1]};
  padding-right: ${({ deletable }) =>
    deletable ? '0' : odelzaThemeCssVariables.spacing[1]};

  user-select: none;
  white-space: nowrap;

  @keyframes base-chip-flash {
    0%,
    100% {
      filter: none;
    }
    50% {
      filter: brightness(0.85);
    }
  }

  &[data-flashing='true'] {
    animation: base-chip-flash 300ms ease-in-out 2;
  }
`;

const StyledLabel = styled.span<{ maxWidth?: number }>`
  line-height: 140%;
  max-width: ${({ maxWidth }) =>
    maxWidth === undefined ? 'none' : `${maxWidth}px`};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledDelete = styled.button<{ danger: boolean }>`
  align-items: center;
  background: none;
  border: none;
  border-bottom-right-radius: ${odelzaThemeCssVariables.border.radius.smRound};
  border-top-right-radius: ${odelzaThemeCssVariables.border.radius.smRound};
  box-sizing: border-box;
  color: inherit;
  corner-shape: round;
  cursor: pointer;
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  height: 20px;
  justify-content: center;
  margin: 0;
  padding: 0;
  user-select: none;
  width: 20px;

  &:hover {
    background-color: ${({ danger }) =>
      danger
        ? odelzaThemeCssVariables.color.red5
        : odelzaThemeCssVariables.color.primary5};
  }
`;

type BaseChipProps = {
  chipId?: string;
  label: string;
  title?: string;
  onRemove?: (event: MouseEvent) => void;
  removeAriaLabel?: string;
  danger?: boolean;
  selected?: boolean;
  isFlashing?: boolean;
  onDoubleClick?: () => void;
  maxLabelWidth?: number;
  leftIcon?: ReactNode;
};

export const BaseChip = ({
  chipId,
  label,
  title,
  onRemove,
  removeAriaLabel = 'Remove',
  danger = false,
  selected = false,
  isFlashing = false,
  onDoubleClick,
  maxLabelWidth,
  leftIcon,
}: BaseChipProps) => {
  const { theme } = useContext(ThemeContext);
  const isDeletable = onRemove !== undefined;

  return (
    <StyledChip
      id={chipId}
      deletable={isDeletable}
      danger={danger}
      selected={selected}
      data-flashing={isFlashing}
      onDoubleClick={onDoubleClick}
    >
      {leftIcon}
      <StyledLabel title={title ?? label} maxWidth={maxLabelWidth}>
        {label}
      </StyledLabel>

      {isDeletable && (
        <StyledDelete
          type="button"
          onClick={onRemove}
          aria-label={removeAriaLabel}
          danger={danger}
        >
          <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        </StyledDelete>
      )}
    </StyledChip>
  );
};
