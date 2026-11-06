import { AggregateOperations } from 'twenty-shared/types';
import { z } from 'zod';

// Structural tool validation; field/filter validation is metadata-dependent and
// runs again inside GroupByRecordsService using the trusted execution context.
export const groupByRecordsToolArgumentsSchema = z
  .object({
    groupBy: z.array(z.record(z.string(), z.unknown())).min(1).max(2),
    aggregateOperation: z
      .nativeEnum(AggregateOperations)
      .default(AggregateOperations.COUNT),
    aggregateFieldName: z.string().min(1).optional(),
    limit: z.number().int().positive().max(100).default(50),
    orderBy: z.enum(['ASC', 'DESC']).default('DESC'),
    rolePermissionConfig: z.never().optional(),
    authContext: z.never().optional(),
    shouldBypassPermissionChecks: z.never().optional(),
  })
  .passthrough();
