import { styled } from '@linaria/react';
import { useContext } from 'react';
import { DataGrid, type DataGridProps } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledDataGridContainer = styled.div<{ headerRowHeight?: number }>`
  --rdg-background-color: ${odelzaThemeCssVariables.background.primary};
  --rdg-border-color: ${odelzaThemeCssVariables.border.color.medium};
  --rdg-color: ${odelzaThemeCssVariables.font.color.primary};
  --rdg-error-cell-background-color: ${odelzaThemeCssVariables.color.transparent
    .red5};
  --rdg-font-size: ${odelzaThemeCssVariables.font.size.sm};
  --rdg-frozen-cell-box-shadow: none;
  --rdg-header-background-color: ${odelzaThemeCssVariables.background.primary};
  --rdg-info-cell-background-color: ${odelzaThemeCssVariables.color.primary};
  --rdg-row-hover-background-color: ${odelzaThemeCssVariables.background
    .secondary};
  --rdg-row-selected-background-color: ${odelzaThemeCssVariables.background
    .primary};
  --rdg-row-selected-hover-background-color: ${odelzaThemeCssVariables
    .background.secondary};
  --rdg-selection-color: ${odelzaThemeCssVariables.color.primary};
  --rdg-summary-border-color: ${odelzaThemeCssVariables.border.color.medium};
  --rdg-warning-cell-background-color: ${odelzaThemeCssVariables.color.orange};
  --row-selected-hover-background-color: ${odelzaThemeCssVariables.background
    .secondary};
  flex: 1;
  min-height: 0;

  > * {
    border: none;
    block-size: 100%;
    width: 100%;
  }

  .rdg-header-row .rdg-cell {
    box-shadow: none;
    color: ${odelzaThemeCssVariables.font.color.tertiary};
    background-color: ${odelzaThemeCssVariables.background.secondary};
    font-size: ${odelzaThemeCssVariables.font.size.sm};
    font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
    letter-spacing: wider;
    border-bottom: ${({ headerRowHeight }) =>
      headerRowHeight === 0
        ? 'none'
        : `1px solid ${odelzaThemeCssVariables.border.color.medium}`};
  }

  .rdg-cell {
    border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.medium};
    border-inline-end: none;
    border-right: none;
    box-shadow: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rdg-row:last-child > .rdg-cell {
    border-bottom: none;
  }

  .rdg-cell[aria-selected='true'] {
    outline: none;
  }

  .rdg-cell-error {
    background-color: ${odelzaThemeCssVariables.color.yellow3};
  }

  .rdg-cell-warning {
    background-color: ${odelzaThemeCssVariables.color.transparent.orange2};
  }

  .rdg-cell-info {
    background-color: ${odelzaThemeCssVariables.color.transparent.primary2};
  }

  .rdg-static {
    cursor: pointer;
  }

  .rdg-static .rdg-header-row {
    display: none;
  }

  .rdg-static .rdg-cell {
    --rdg-selection-color: none;
  }

  .rdg-example .rdg-cell {
    --rdg-selection-color: none;
    border-bottom: none;
  }

  .rdg-radio {
    align-items: center;
    display: flex;
  }

  .rdg-checkbox {
    align-items: center;
    display: flex;
    line-height: none;
  }
`;

type SpreadsheetImportTableProps<Data> = Pick<
  DataGridProps<Data>,
  | 'selectedRows'
  | 'onSelectedRowsChange'
  | 'columns'
  | 'headerRowHeight'
  | 'rowKeyGetter'
  | 'rows'
> &
  Partial<
    Pick<DataGridProps<Data>, 'onCellClick' | 'renderers' | 'onRowsChange'>
  > & {
    className?: string;
    rowHeight?: number;
    hiddenHeader?: boolean;
  };

export const SpreadsheetImportTable = <Data,>({
  className,
  columns,
  renderers,
  headerRowHeight,
  rowKeyGetter,
  rows,
  onRowsChange,
  onCellClick,
  onSelectedRowsChange,
  selectedRows,
}: SpreadsheetImportTableProps<Data>) => {
  const { colorScheme } = useContext(ThemeContext);

  const { rtl } = useSpreadsheetImportInternal();
  const themeClassName = colorScheme === 'dark' ? 'rdg-dark' : 'rdg-light';

  if (!rows?.length || !columns?.length) return null;

  return (
    <StyledDataGridContainer headerRowHeight={headerRowHeight ?? undefined}>
      <DataGrid
        direction={rtl ? 'rtl' : 'ltr'}
        rowHeight={40}
        {...{
          className: `${className || ''} ${themeClassName}`,
          columns,
          headerRowHeight,
          rowKeyGetter,
          onRowsChange,
          rows,
          renderers,
          onCellClick,
          onSelectedRowsChange,
          selectedRows,
        }}
      />
    </StyledDataGridContainer>
  );
};
