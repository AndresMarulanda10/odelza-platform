import { type WorkflowFindRecordsAction } from '@/workflow/types/Workflow';

type FindRecordsInput = WorkflowFindRecordsAction['settings']['input'];

// Keep MCP-authored paging inputs when unrelated controls update the action.
export const buildFindRecordsActionInput = (
  previous: FindRecordsInput,
  updates: Partial<FindRecordsInput>,
): FindRecordsInput => ({ ...previous, ...updates });
