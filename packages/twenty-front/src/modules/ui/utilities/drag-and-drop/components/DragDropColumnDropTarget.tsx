import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { DragDropColumnDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropColumnDndContext';

const StyledDropTarget = styled.div<{
  $compact?: boolean;
  $overlay?: boolean;
}>`
  height: 100%;
  min-height: ${({ $compact }) =>
    $compact ? '100%' : odelzaThemeCssVariables.spacing[2]};
  position: ${({ $overlay }) => ($overlay ? 'absolute' : 'relative')};
  transition: background-color 120ms ease-out;
  width: 100%;

  &::before {
    background-color: ${odelzaThemeCssVariables.color.primary};
    border-radius: 0 ${odelzaThemeCssVariables.border.radius.sm}
      ${odelzaThemeCssVariables.border.radius.sm} 0;
    content: '';
    height: 100%;
    left: 0;
    opacity: 0;
    position: absolute;
    top: 0;
    transform: scaleY(0.7);
    transform-origin: center;
    transition:
      opacity 120ms ease-out,
      transform 120ms ease-out;
    width: 2px;
  }

  &[data-drag-over='true'] {
    background-color: ${odelzaThemeCssVariables.background.transparent.accent};
  }

  &[data-drag-over='true']::before {
    opacity: 1;
    transform: scaleY(1);
  }
`;

type DragDropColumnDropTargetProps = {
  children?: ReactNode;
  compact?: boolean;
  index: number;
  overlay?: boolean;
};

export const DragDropColumnDropTarget = ({
  children,
  compact = false,
  index,
  overlay = false,
}: DragDropColumnDropTargetProps) => {
  const { activeDropTargetIndex } = useContext(DragDropColumnDndContext);

  const isDragOver = activeDropTargetIndex === index;

  return (
    <StyledDropTarget
      $compact={compact}
      $overlay={overlay}
      data-drag-over={isDragOver ? 'true' : undefined}
    >
      {children}
    </StyledDropTarget>
  );
};
