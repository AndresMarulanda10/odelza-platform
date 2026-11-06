import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconPlayerPlay } from 'twenty-ui/icon';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

type HeroPlayButtonProps = {
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
};

const StyledButton = styled.button`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.primary};
  border: none;
  border-radius: 50%;
  box-shadow: ${odelzaThemeCssVariables.boxShadow.strong};
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  corner-shape: round;
  cursor: pointer;
  display: inline-flex;
  height: 44px;
  justify-content: center;
  padding: 0;
  transition:
    transform 120ms ease-out,
    background-color 120ms ease-out;
  width: 44px;

  &:hover {
    background: ${odelzaThemeCssVariables.background.secondary};
    transform: scale(1.04);
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${odelzaThemeCssVariables.border.color.accent};
    outline-offset: 2px;
  }
`;

export const HeroPlayButton = ({
  onClick,
  ariaLabel = 'Play video',
  className,
}: HeroPlayButtonProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledButton
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
    >
      <IconPlayerPlay size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
    </StyledButton>
  );
};
