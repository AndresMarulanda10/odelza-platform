import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export const getTriggerIconColor = (
  triggerType: WorkflowTriggerType,
): string => {
  switch (triggerType) {
    case 'DATABASE_EVENT':
      return odelzaThemeCssVariables.color.primary;
    case 'CRON':
    case 'MANUAL':
    case 'WEBHOOK':
      return odelzaThemeCssVariables.color.purple;
    default:
      return odelzaThemeCssVariables.color.purple;
  }
};
