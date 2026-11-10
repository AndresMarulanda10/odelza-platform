import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { Card, OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

export type TableItem = {
  Icon?: IconComponent;
  label: string;
  value: string | number | React.ReactNode;
  onClick?: () => void;
};

type SettingsTableCardProps = {
  items: TableItem[];
  rounded?: boolean;
  gridAutoColumns?: string;
  labelAlign?: 'left' | 'center' | 'right';
  valueAlign?: 'left' | 'center' | 'right';
  className?: string;
};

export const SettingsTableCard = ({
  items,
  rounded = false,
  gridAutoColumns,
  labelAlign = 'left',
  valueAlign = 'left',
  className,
}: SettingsTableCardProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <Card
      rounded={rounded}
      className={className}
      backgroundColor={odelzaThemeCssVariables.background.secondary}
    >
      <Table>
        {items.map((item, index) => (
          <TableRow key={index + item.label} gridAutoColumns={gridAutoColumns}>
            <TableCell
              align={labelAlign}
              color={odelzaThemeCssVariables.font.color.tertiary}
              gap={odelzaThemeCssVariables.spacing[2]}
              overflow="hidden"
            >
              {item.Icon && <item.Icon size={theme.icon.size.md} />}
              <OverflowingTextWithTooltip text={item.label} />
            </TableCell>
            <TableCell
              align={valueAlign}
              color={odelzaThemeCssVariables.font.color.primary}
              onClick={item.onClick}
              clickable={isDefined(item.onClick)}
            >
              {item.value}
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </Card>
  );
};
