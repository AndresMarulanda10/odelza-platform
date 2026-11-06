import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowFindRecordsActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      limit: z
        .union([
          z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
          z.string().regex(/^\{\{[^{}]+\}\}$/),
        ])
        .optional(),
      offset: z
        .union([
          z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
          z.string().regex(/^\{\{[^{}]+\}\}$/),
        ])
        .optional(),
      after: z.string().min(1).optional(),
      filter: z
        .object({
          recordFilterGroups: z.array(z.any()).optional(),
          recordFilters: z.array(z.any()).optional(),
          gqlOperationFilter: z.any().optional().nullable(),
        })
        .optional(),
      orderBy: z
        .object({
          recordSorts: z.array(z.any()).optional(),
          gqlOperationOrderBy: z
            .array(z.record(z.string(), z.any()))
            .optional(),
        })
        .optional(),
    }),
  });
