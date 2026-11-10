import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledTr = styled.div<{
  isDragging: boolean;
}>`
  border-top: ${({ isDragging }) =>
    isDragging
      ? `1px solid ${odelzaThemeCssVariables.border.color.medium}`
      : 'none'};

  display: flex;
  flex-direction: row;

  &[data-focused='true'],
  &[data-active='true'] {
    div.table-cell,
    div.table-cell-0-0 {
      &:not(:first-of-type) {
        background-color: ${odelzaThemeCssVariables.background.selection};
        border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.medium};
        border-color: ${odelzaThemeCssVariables.border.color.medium};
      }
      &:nth-of-type(2) {
        border-left: 1px solid ${odelzaThemeCssVariables.border.color.medium};

        margin-left: -1px;

        div {
          margin-left: -1px;
        }
      }
      &:last-of-type {
        border-radius: 0 ${odelzaThemeCssVariables.border.radius.sm}
          ${odelzaThemeCssVariables.border.radius.sm} 0;
        border-right: 1px solid ${odelzaThemeCssVariables.border.color.medium};
      }
    }
  }
`;

export const RecordTableRowDiv = StyledTr;
