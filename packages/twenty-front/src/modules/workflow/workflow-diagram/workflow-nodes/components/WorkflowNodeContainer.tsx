import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledNodeContainer = styled.div<{
  runStatus?: WorkflowRunStepStatus;
  isConnectable?: boolean;
  selected: boolean;
}>`
  align-items: center;
  background: ${({ runStatus, selected }) => {
    const colors = getWorkflowDiagramColors({ runStatus });
    return selected ? colors.selected.background : colors.unselected.background;
  }};
  border-color: ${({ runStatus, selected }) => {
    const colors = getWorkflowDiagramColors({ runStatus });
    return selected
      ? colors.selected.borderColor
      : colors.unselected.borderColor;
  }};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  border-style: solid;
  border-width: 1px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  max-width: 240px;
  min-width: 44px;
  padding: ${odelzaThemeCssVariables.spacing[2]};

  position: relative;

  transition: border-color 0.1s;

  &:hover {
    background: ${({ runStatus, selected }) => {
      const colors = getWorkflowDiagramColors({ runStatus });
      const bg = selected
        ? colors.selected.background
        : colors.unselected.background;
      return `linear-gradient(0deg, ${odelzaThemeCssVariables.background.transparent.lighter} 0%, ${odelzaThemeCssVariables.background.transparent.lighter} 100%), ${bg}`;
    }};

    border-color: ${({ runStatus, selected, isConnectable }) => {
      if (isConnectable === true) return odelzaThemeCssVariables.color.primary;
      const colors = getWorkflowDiagramColors({ runStatus });
      return selected
        ? colors.selected.borderColor
        : colors.unselected.borderColor;
    }};
  }
`;

export { StyledNodeContainer as WorkflowNodeContainer };
