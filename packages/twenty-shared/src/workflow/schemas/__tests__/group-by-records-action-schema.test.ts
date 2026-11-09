import { workflowGroupByRecordsActionSchema } from '../group-by-records-action-schema';
import { workflowActionSchema } from '../workflow-action-schema';

describe('GROUP_BY_RECORDS authoring schema', () => {
  const action = {
    id: 'e01a50e9-487b-4d31-8250-ac6b7947cc67',
    name: 'Group records',
    type: 'GROUP_BY_RECORDS',
    valid: false,
    settings: {
      input: { objectName: 'company', groupBy: [{ status: true }] },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
    },
  };

  it('registers the native action in the public discriminated union', () => {
    expect(workflowActionSchema.parse(action).type).toBe('GROUP_BY_RECORDS');
  });
  it('accepts exact workflow bindings for dynamically resolved inputs', () => {
    expect(
      workflowGroupByRecordsActionSchema.safeParse({
        ...action,
        settings: {
          ...action.settings,
          input: {
            ...action.settings.input,
            limit: '{{step.limit}}',
            groupBy: '{{step.groups}}',
          },
        },
      }).success,
    ).toBe(true);
  });
  it.each([
    { limit: 0 },
    { limit: 201 },
    { groupBy: [] },
    { groupBy: [{ a: true }, { b: true }, { c: true }] },
    { aggregateOperation: 'BAD' },
    { rolePermissionConfig: { shouldBypassPermissionChecks: true } },
  ])('rejects malformed static authoring input %p', (input) => {
    expect(
      workflowGroupByRecordsActionSchema.safeParse({
        ...action,
        settings: {
          ...action.settings,
          input: { ...action.settings.input, ...input },
        },
      }).success,
    ).toBe(false);
  });
});
