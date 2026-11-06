import {
  AggregateOperations,
  ViewFilterOperand,
  RecordFilterGroupLogicalOperator,
} from 'twenty-shared/types';
import { resolveInput } from 'twenty-shared/utils';
import { workflowGroupByRecordsInputSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

const resolvedSchema = workflowGroupByRecordsInputSchema.extend({
  groupBy: z.array(z.record(z.string(), z.unknown())).min(1).max(2),
  aggregateOperation: z
    .nativeEnum(AggregateOperations)
    .default(AggregateOperations.COUNT),
  limit: z.number().int().positive().max(200).default(200),
  orderBy: z.enum(['ASC', 'DESC']).default('DESC'),
  filter: z
    .object({
      recordFilters: z
        .array(
          z
            .object({
              id: z.string().min(1),
              fieldMetadataId: z.string().min(1),
              type: z.string().min(1),
              operand: z.nativeEnum(ViewFilterOperand),
              value: z.string(),
              recordFilterGroupId: z.string().optional(),
              subFieldName: z.string().nullable().optional(),
              relationTargetFieldMetadataId: z.string().nullable().optional(),
              rlsDynamicValue: z.never().optional(),
            })
            .passthrough(),
        )
        .optional(),
      recordFilterGroups: z
        .array(
          z
            .object({
              id: z.string().min(1),
              logicalOperator: z.nativeEnum(RecordFilterGroupLogicalOperator),
              parentRecordFilterGroupId: z.string().nullable().optional(),
            })
            .passthrough(),
        )
        .optional(),
      gqlOperationFilter: z.record(z.string(), z.unknown()).optional(),
    })
    .strict()
    .optional(),
});

export const parseWorkflowGroupByInput = (
  input: unknown,
  context: Record<string, unknown>,
) => {
  const authored = workflowGroupByRecordsInputSchema.parse(input);
  const resolved = resolveInput(authored, context);
  const assertResolved = (original: unknown, value: unknown): void => {
    if (
      typeof original === 'string' &&
      original.includes('{{') &&
      value === undefined
    ) {
      throw new Error('Unresolved group-by input variable');
    }
    if (original !== null && typeof original === 'object') {
      for (const [key, child] of Object.entries(original)) {
        assertResolved(
          child,
          value !== null && typeof value === 'object'
            ? (value as Record<string, unknown>)[key]
            : undefined,
        );
      }
    }
  };
  assertResolved(authored, resolved);
  // Unresolved embedded variables must not become literal filter predicates.
  if (JSON.stringify(resolved)?.includes('{{'))
    throw new Error('Unresolved group-by input variable');
  const parsed = resolvedSchema.parse(resolved);
  if (parsed.filter?.recordFilters && parsed.filter.gqlOperationFilter) {
    throw new Error('Choose record filters or a native filter, not both');
  }
  const groups = parsed.filter?.recordFilterGroups ?? [];
  const ids = new Set(groups.map((group) => group.id));
  if (
    ids.size !== groups.length ||
    (groups.length > 0 &&
      groups.filter((group) => !group.parentRecordFilterGroupId).length !== 1)
  ) {
    throw new Error('Invalid group-by filter groups');
  }
  for (const group of groups) {
    const visited = new Set([group.id]);
    let parent = group.parentRecordFilterGroupId;
    while (parent) {
      if (visited.has(parent) || !ids.has(parent))
        throw new Error('Invalid group-by filter group parent');
      visited.add(parent);
      parent = groups.find(
        (candidate) => candidate.id === parent,
      )?.parentRecordFilterGroupId;
    }
  }
  for (const filter of parsed.filter?.recordFilters ?? []) {
    if (filter.recordFilterGroupId && !ids.has(filter.recordFilterGroupId))
      throw new Error('Unknown group-by filter group');
  }
  return parsed;
};
