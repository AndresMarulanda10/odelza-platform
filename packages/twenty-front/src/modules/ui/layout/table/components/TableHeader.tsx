import { styled } from '@linaria/react';
import { type ComponentPropsWithoutRef, type Ref, forwardRef } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type TableHeaderProps = Omit<ComponentPropsWithoutRef<'div'>, 'onClick'> & {
  align?: 'left' | 'center' | 'right';
  onClick?: () => void;
  padding?: string;
};

const StyledTableHeader = styled.div<TableHeaderProps>`
  align-items: center;
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.light};
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: ${odelzaThemeCssVariables.spacing[8]};
  justify-content: ${({ align }) =>
    align === 'right'
      ? 'flex-end'
      : align === 'center'
        ? 'center'
        : 'flex-start'};
  padding: ${({ padding }) =>
    padding ?? `0 ${odelzaThemeCssVariables.spacing[2]}`};
  text-align: ${({ align }) => align ?? 'left'};
`;

export const TableHeader = forwardRef(
  (props: TableHeaderProps, ref: Ref<HTMLDivElement>) => (
    <StyledTableHeader
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      ref={ref}
      data-table-header
    />
  ),
);
