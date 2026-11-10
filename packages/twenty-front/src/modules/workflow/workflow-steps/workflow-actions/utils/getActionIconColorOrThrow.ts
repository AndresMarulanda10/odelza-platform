import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { assertUnreachable } from 'twenty-shared/utils';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export const getActionIconColorOrThrow = (
  actionType: WorkflowActionType,
): string => {
  switch (actionType) {
    case 'CODE':
    case 'LOGIC_FUNCTION':
    case 'HTTP_REQUEST':
    case 'SEND_EMAIL':
    case 'DRAFT_EMAIL':
    case 'CREATE_CALENDAR_EVENT':
      return odelzaThemeCssVariables.color.red;
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'UPSERT_RECORD':
    case 'FIND_RECORDS':
    case 'GROUP_BY_RECORDS':
    case 'PICK_RECORD':
      return odelzaThemeCssVariables.font.color.tertiary;
    case 'FORM':
      return odelzaThemeCssVariables.color.orange;
    case 'ITERATOR':
    case 'EMPTY':
    case 'FILTER':
    case 'IF_ELSE':
    case 'DELAY':
      return odelzaThemeCssVariables.color.green12;
    case 'AI_AGENT':
      return odelzaThemeCssVariables.color.pink;
    default:
      assertUnreachable(actionType, `Unsupported action type: ${actionType}`);
  }
};
