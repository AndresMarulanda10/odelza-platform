import { z } from 'zod';
import { AggregateOperations } from '../../types/AggregateOperations';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

const binding = z.string().regex(/^\{\{[^{}]+\}\}$/);
const dimension = z
  .record(
    z.string(),
    z.union([
      z.literal(true),
      z.record(z.string(), z.union([z.string(), z.literal(true)])),
    ]),
  )
  .refine(
    (entry) => Object.keys(entry).length === 1,
    'Choose exactly one dimension field',
  );

export const workflowGroupByRecordsInputSchema = z
  .object({
    objectName: z.string().min(1),
    groupBy: z.union([z.array(dimension).min(1).max(2), binding]),
    aggregateOperation: z
      .union([z.nativeEnum(AggregateOperations), binding])
      .optional(),
    aggregateFieldName: z.string().min(1).optional(),
    limit: z.union([z.number().int().positive().max(200), binding]).optional(),
    orderBy: z.union([z.enum(['ASC', 'DESC']), binding]).optional(),
    filter: z
      .object({
        recordFilters: z.array(z.any()).optional(),
        recordFilterGroups: z.array(z.any()).optional(),
        gqlOperationFilter: z
          .union([z.record(z.string(), z.any()), binding])
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const workflowGroupByRecordsActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: workflowGroupByRecordsInputSchema,
  });
