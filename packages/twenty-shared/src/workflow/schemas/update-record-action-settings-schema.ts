import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { objectRecordSchema } from './object-record-schema';
import { recordUpdatePreconditionSchema } from './record-update-precondition-schema';

export const workflowUpdateRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      objectRecord: objectRecordSchema,
      objectRecordId: z.string(),
      fieldsToUpdate: z.array(z.string()),
      precondition: recordUpdatePreconditionSchema.optional(),
    }),
  });
