import { z } from 'zod';

// Field names and operator/value types are checked against workspace metadata
// after workflow bindings resolve. Never strip unknown predicate keys.
export const recordUpdatePreconditionSchema = z
  .record(z.string(), z.any())
  .refine((value) => Object.keys(value).length > 0, {
    message: 'A precondition must contain a target-row predicate',
  });

export type RecordUpdatePrecondition = z.infer<
  typeof recordUpdatePreconditionSchema
>;
