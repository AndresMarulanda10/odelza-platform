import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowGroupByRecordsActionSettingsSchema } from './group-by-records-action-settings-schema';

export const workflowGroupByRecordsActionSchema =
  baseWorkflowActionSchema.extend({
    type: z.literal('GROUP_BY_RECORDS'),
    settings: workflowGroupByRecordsActionSettingsSchema,
  });
