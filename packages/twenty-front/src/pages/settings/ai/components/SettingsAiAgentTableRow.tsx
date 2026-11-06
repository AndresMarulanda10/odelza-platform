import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';

import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useIcons } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';
import { type Agent } from '~/generated-metadata/graphql';

export type SettingsAiAgentTableRowProps = {
  action: ReactNode;
  agent: Agent;
  link?: string;
};

export const AI_AGENT_TABLE_ROW_GRID_TEMPLATE_COLUMNS = '1fr 120px 36px';

const StyledIconContainer = styled.div`
  flex-shrink: 0;
  height: ${odelzaThemeCssVariables.spacing[4]};
`;

export const SettingsAiAgentTableRow = ({
  action,
  agent,
  link,
}: SettingsAiAgentTableRowProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const Icon = getIcon(agent.icon || 'IconRobot');

  return (
    <TableRow
      gridTemplateColumns={AI_AGENT_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      key={agent.id}
      to={link}
    >
      <TableCell
        color={odelzaThemeCssVariables.font.color.primary}
        gap={odelzaThemeCssVariables.spacing[2]}
        minWidth="0"
        overflow="hidden"
      >
        <StyledIconContainer>
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        </StyledIconContainer>
        <OverflowingTextWithTooltip text={agent.label} />
      </TableCell>
      <TableCell>
        <SettingsItemTypeTag item={agent} />
      </TableCell>
      <TableCell
        align="right"
        padding={`0 ${odelzaThemeCssVariables.spacing[2]} 0 0`}
      >
        {action}
      </TableCell>
    </TableRow>
  );
};
