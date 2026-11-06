import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

// ResolveInput can return a number or a numeric string for a single binding.
// Do not use Number(value) without checking its syntax (arrays, spaces and null coerce).
export const parseWorkflowPaginationInput = (input: {
  limit?: unknown;
  offset?: unknown;
  after?: unknown;
}): { limit?: number; offset: number; after?: string } => {
  const parseInteger = (value: unknown, minimum: number, name: string) => {
    const parsed =
      typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
    if (
      typeof parsed !== 'number' ||
      !Number.isSafeInteger(parsed) ||
      parsed < minimum
    ) {
      throw new Error(
        `${name} must resolve to a safe integer greater than or equal to ${minimum}`,
      );
    }
    return parsed;
  };
  const limit =
    input.limit === undefined
      ? undefined
      : Math.min(parseInteger(input.limit, 1, 'Limit'), QUERY_MAX_RECORDS);
  const offset =
    input.offset === undefined ? 0 : parseInteger(input.offset, 0, 'Offset');
  if (
    input.after !== undefined &&
    (typeof input.after !== 'string' || !input.after.length || offset !== 0)
  ) {
    throw new Error(
      'After must resolve to a nonempty cursor without a nonzero offset',
    );
  }
  return { limit, offset, after: input.after as string | undefined };
};
