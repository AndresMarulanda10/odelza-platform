import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledBoardCard = styled.div<{
  isDragging?: boolean;
  isSecondaryDragged?: boolean;
  isPrimaryMultiDrag?: boolean;
}>`
  background-color: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  color: ${odelzaThemeCssVariables.font.color.primary};
  cursor: pointer;
  opacity: ${({ isSecondaryDragged }) => (isSecondaryDragged ? '0.3' : '1')};

  width: 100%;

  &[data-selected='true'] {
    background-color: ${odelzaThemeCssVariables.background.selection};
  }

  &[data-focused='true'] {
    background-color: ${odelzaThemeCssVariables.background.tertiary};
  }

  &[data-active='true'] {
    background-color: ${odelzaThemeCssVariables.background.selection};
    border: 1px solid ${odelzaThemeCssVariables.color.primary7};
  }

  &:hover {
    border: 1px solid ${odelzaThemeCssVariables.border.color.strong};

    &[data-active='true'] {
      border: 1px solid ${odelzaThemeCssVariables.color.primary7};
    }
  }

  .checkbox-container {
    flex-shrink: 0;
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    transition: all ease-in-out 160ms;
  }

  &[data-selected='true'] .checkbox-container,
  &:hover .checkbox-container {
    max-width: ${odelzaThemeCssVariables.spacing[6]};
    opacity: 1;
    pointer-events: auto;
  }

  .compact-icon-container {
    opacity: 0;
    transition: all ease-in-out 160ms;
  }
  &:hover .compact-icon-container {
    opacity: 1;
  }
`;

export { StyledBoardCard as RecordCard };
