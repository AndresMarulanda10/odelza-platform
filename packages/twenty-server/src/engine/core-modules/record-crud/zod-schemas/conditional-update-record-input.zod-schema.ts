import { z } from 'zod';
import { recordUpdatePreconditionSchema } from 'twenty-shared/workflow';

// Dispatch validates this envelope even when invoked without catalog hydration.
export const conditionalUpdateRecordInputSchema = z
  .object({
    id: z.string().uuid(),
    data: z
      .record(z.string(), z.unknown())
      .refine(
        (data) => Object.keys(data).length > 0,
        'Provide fields to update',
      ),
    precondition: recordUpdatePreconditionSchema,
  })
  .strict();
