import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeaderCell = styled.div<{
  zIndex?: number;
  shouldDisplayBorderBottom: boolean;
  isResizing: boolean;
  isReadOnly: boolean;
}>`
  background-color: ${odelzaThemeCssVariables.background.primary};
  border-bottom: ${({ shouldDisplayBorderBottom }) =>
    shouldDisplayBorderBottom
      ? `1px solid ${odelzaThemeCssVariables.border.color.light}`
      : 'none'};
  border-right: 1px solid ${odelzaThemeCssVariables.border.color.light};

  color: ${odelzaThemeCssVariables.font.color.tertiary};

  cursor: ${({ isResizing, isReadOnly }) =>
    isReadOnly ? 'default' : isResizing ? 'col-resize' : 'pointer'};
  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  max-height: ${RECORD_TABLE_ROW_HEIGHT}px;
  padding: 0;

  position: relative;

  text-align: left;

  &:hover {
    background: ${({ isResizing, isReadOnly }) =>
      isReadOnly || isResizing
        ? odelzaThemeCssVariables.background.primary
        : odelzaThemeCssVariables.background.secondary};
  }

  &:active {
    background: ${({ isResizing, isReadOnly }) =>
      isReadOnly || isResizing
        ? odelzaThemeCssVariables.background.primary
        : odelzaThemeCssVariables.background.tertiary};
  }

  user-select: none;

  z-index: ${({ zIndex }) => zIndex ?? 'auto'};
`;

export const RecordTableHeaderCellContainer = StyledHeaderCell;
