import { parseWorkflowGroupByInput } from '../parse-workflow-group-by-input.util';

describe('workflow group-by input resolution', () => {
  const input = { objectName: 'company', groupBy: [{ status: true }] };
  it('resolves native array and number bindings', () => {
    expect(
      parseWorkflowGroupByInput(
        {
          ...input,
          limit: '{{previous.limit}}',
          groupBy: '{{previous.groups}}',
        },
        {
          previous: { limit: 10, groups: [{ status: true }] },
        },
      ),
    ).toMatchObject({ limit: 10, groupBy: input.groupBy });
  });
  it.each([0, -1, 201, 1.2, '10', null, {}, []])(
    'rejects invalid resolved limit %p',
    (limit) => {
      expect(() =>
        parseWorkflowGroupByInput(
          { ...input, limit: '{{previous.limit}}' },
          { previous: { limit } },
        ),
      ).toThrow();
    },
  );
  it('rejects unresolved required group variables', () => {
    expect(() =>
      parseWorkflowGroupByInput(
        { ...input, groupBy: '{{missing.groups}}' },
        {},
      ),
    ).toThrow();
  });
  it('does not turn an unresolved optional limit into the default cap', () => {
    expect(() =>
      parseWorkflowGroupByInput({ ...input, limit: '{{missing.limit}}' }, {}),
    ).toThrow();
  });
  it.each([
    {
      recordFilters: [
        {
          id: 'f',
          fieldMetadataId: 'status',
          type: 'TEXT',
          operand: 'IS',
          value: '',
          recordFilterGroupId: 'missing',
        },
      ],
    },
    {
      recordFilterGroups: [
        { id: 'a', logicalOperator: 'AND', parentRecordFilterGroupId: 'a' },
      ],
    },
    { recordFilters: [], gqlOperationFilter: { status: { eq: 'open' } } },
  ])('rejects ambiguous or disconnected authored filters %p', (filter) => {
    expect(() => parseWorkflowGroupByInput({ ...input, filter }, {})).toThrow();
  });
  it('rejects authored privilege injection', () => {
    expect(() =>
      parseWorkflowGroupByInput(
        {
          ...input,
          rolePermissionConfig: { shouldBypassPermissionChecks: true },
        },
        {},
      ),
    ).toThrow();
  });
});
