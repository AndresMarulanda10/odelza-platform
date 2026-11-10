import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type WorkflowDiagramColors = {
  background: string;
  borderColor: string;
  color: string;
  titleColor: string;
  tagBackground: string;
};

export type WorkflowDiagramNodeColors = {
  selected: WorkflowDiagramColors;
  unselected: WorkflowDiagramColors;
};

export const getWorkflowDiagramColors = ({
  runStatus,
}: {
  runStatus?: WorkflowRunStepStatus;
}): WorkflowDiagramNodeColors => {
  switch (runStatus) {
    case 'PENDING':
    case 'RUNNING': {
      return {
        selected: {
          background: odelzaThemeCssVariables.color.yellow2,
          borderColor: odelzaThemeCssVariables.color.yellow,
          color: odelzaThemeCssVariables.tag.text.yellow,
          titleColor: odelzaThemeCssVariables.font.color.primary,
          tagBackground: odelzaThemeCssVariables.tag.background.yellow,
        },
        unselected: {
          background: odelzaThemeCssVariables.background.secondary,
          borderColor: odelzaThemeCssVariables.border.color.strong,
          color: odelzaThemeCssVariables.tag.text.yellow,
          titleColor: odelzaThemeCssVariables.font.color.primary,
          tagBackground: odelzaThemeCssVariables.tag.background.yellow,
        },
      };
    }
    case 'FAILED':
    case 'FAILED_SAFELY': {
      return {
        selected: {
          background: odelzaThemeCssVariables.color.red2,
          borderColor: odelzaThemeCssVariables.color.red,
          color: odelzaThemeCssVariables.tag.text.red,
          titleColor: odelzaThemeCssVariables.font.color.primary,
          tagBackground: odelzaThemeCssVariables.tag.background.red,
        },
        unselected: {
          background: odelzaThemeCssVariables.background.secondary,
          borderColor: odelzaThemeCssVariables.border.color.strong,
          color: odelzaThemeCssVariables.tag.text.red,
          titleColor: odelzaThemeCssVariables.font.color.primary,
          tagBackground: odelzaThemeCssVariables.tag.background.red,
        },
      };
    }
    case 'STOPPED':
    case 'SUCCESS': {
      return {
        selected: {
          background: odelzaThemeCssVariables.color.turquoise2,
          borderColor: odelzaThemeCssVariables.color.turquoise,
          color: odelzaThemeCssVariables.tag.text.green,
          titleColor: odelzaThemeCssVariables.font.color.primary,
          tagBackground: odelzaThemeCssVariables.tag.background.turquoise,
        },
        unselected: {
          background: odelzaThemeCssVariables.background.secondary,
          borderColor: odelzaThemeCssVariables.border.color.strong,
          color: odelzaThemeCssVariables.tag.text.green,
          titleColor: odelzaThemeCssVariables.font.color.primary,
          tagBackground: odelzaThemeCssVariables.tag.background.turquoise,
        },
      };
    }
    default: {
      return {
        selected: {
          background: odelzaThemeCssVariables.color.primary2,
          borderColor: odelzaThemeCssVariables.color.primary,
          color: odelzaThemeCssVariables.tag.text.blue,
          titleColor: odelzaThemeCssVariables.font.color.primary,
          tagBackground: odelzaThemeCssVariables.border.color.strong,
        },
        unselected: {
          background: odelzaThemeCssVariables.background.secondary,
          borderColor: odelzaThemeCssVariables.border.color.strong,
          color: odelzaThemeCssVariables.font.color.tertiary,
          titleColor: odelzaThemeCssVariables.font.color.light,
          tagBackground: odelzaThemeCssVariables.border.color.strong,
        },
      };
    }
  }
};
