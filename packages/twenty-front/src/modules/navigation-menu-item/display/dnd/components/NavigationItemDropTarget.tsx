import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { type NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';

const StyledDropTarget = styled.div<{
  $compact?: boolean;
  $highlightPosition?: 'top' | 'bottom';
}>`
  min-height: ${({ $compact }) =>
    $compact ? 0 : odelzaThemeCssVariables.spacing[2]};
  position: relative;
  transition: all 150ms ease-in-out;

  &[data-drag-over='true'] {
    background-color: ${odelzaThemeCssVariables.background.transparent.accent};

    &::before {
      content: '';
      position: absolute;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${odelzaThemeCssVariables.color.primary};
      ${({ $highlightPosition }) =>
        $highlightPosition === 'top'
          ? `
      top: 0;
      border-radius: 0 0 ${odelzaThemeCssVariables.border.radius.sm}
        ${odelzaThemeCssVariables.border.radius.sm};
      `
          : `
      bottom: 0;
      border-radius: ${odelzaThemeCssVariables.border.radius.sm}
        ${odelzaThemeCssVariables.border.radius.sm} 0 0;
      `}
    }
  }

  &[data-drop-forbidden='true'] {
    cursor: not-allowed;
  }
`;

type NavigationItemDropTargetProps = {
  folderId: string | null;
  index: number;
  sectionId: NavigationSections;
  children?: ReactNode;
  compact?: boolean;
  dropTargetIdOverride?: string;
  highlightPosition?: 'top' | 'bottom';
};

export const NavigationItemDropTarget = ({
  folderId,
  index,
  sectionId,
  children,
  compact = false,
  dropTargetIdOverride,
  highlightPosition = 'bottom',
}: NavigationItemDropTargetProps) => {
  const { activeDropTargetId, forbiddenDropTargetId } = useContext(
    NavigationDropTargetContext,
  );
  const dropTargetId =
    dropTargetIdOverride ?? `${sectionId}-${folderId ?? 'orphan'}-${index}`;
  const isDragOver = activeDropTargetId === dropTargetId;
  const isDropForbidden = forbiddenDropTargetId === dropTargetId;

  return (
    <StyledDropTarget
      $compact={compact}
      $highlightPosition={highlightPosition}
      data-drag-over={isDragOver && !isDropForbidden ? 'true' : undefined}
      data-drop-forbidden={isDropForbidden ? 'true' : undefined}
    >
      {children}
    </StyledDropTarget>
  );
};
