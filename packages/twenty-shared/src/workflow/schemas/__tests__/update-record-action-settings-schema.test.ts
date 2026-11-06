import { workflowUpdateRecordActionSettingsSchema } from '../update-record-action-settings-schema';

describe('update record settings precondition', () => {
  const input = {
    objectName: 'widget',
    objectRecordId: 'id',
    objectRecord: { data: 'custom', precondition: 'custom' },
    fieldsToUpdate: ['data', 'precondition'],
  };
  const base = {
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  };
  it('keeps legacy settings and custom record field names unchanged', () => {
    expect(
      workflowUpdateRecordActionSettingsSchema.parse({ ...base, input }).input,
    ).toEqual(input);
  });
  it('keeps the optional condition separate from record data', () => {
    const conditional = {
      ...input,
      precondition: { guard: { eq: 'captured' } },
    };
    expect(
      workflowUpdateRecordActionSettingsSchema.parse({
        ...base,
        input: conditional,
      }).input,
    ).toEqual(conditional);
  });
  it('rejects an empty opt-in condition', () => {
    expect(
      workflowUpdateRecordActionSettingsSchema.safeParse({
        ...base,
        input: { ...input, precondition: {} },
      }).success,
    ).toBe(false);
  });
});
