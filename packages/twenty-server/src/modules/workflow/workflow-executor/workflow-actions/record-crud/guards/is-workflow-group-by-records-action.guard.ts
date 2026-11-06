import { WorkflowActionType } from 'twenty-shared/workflow';
import {
  type WorkflowAction,
  type WorkflowGroupByRecordsAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowGroupByRecordsAction = (
  action: WorkflowAction,
): action is WorkflowGroupByRecordsAction =>
  action.type === WorkflowActionType.GROUP_BY_RECORDS;
