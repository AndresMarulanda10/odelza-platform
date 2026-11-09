import { validateConditionalUpdatePayload } from '../validate-conditional-update-payload.util';

describe('conditional payload safety before enrichment', () => {
  const fields = [
    'TEXT',
    'CURRENCY',
    'FULL_NAME',
    'ADDRESS',
    'FILES',
    'RELATION',
    'RAW_JSON',
  ].map((type) => ({ id: type, name: type.toLowerCase(), type }));
  const context = {
    flatObjectMetadata: { fieldIds: fields.map(({ id }) => id) },
    flatFieldMetadataMaps: {
      universalIdentifierById: Object.fromEntries(
        fields.map(({ id }) => [id, id]),
      ),
      byUniversalIdentifier: Object.fromEntries(
        fields.map((field) => [field.id, field]),
      ),
    },
  } as never;
  it.each([
    { files: [] },
    { relation: { connect: { id: 'x' } } },
    { raw_json: {} },
    { missing: 1 },
    { text: () => 'SQL' },
    { text: { eq: 'x' } },
    { currency: { amountMicros: { injected: true } } },
  ])('rejects unsupported payload before side effects: %p', (payload) => {
    expect(() => validateConditionalUpdatePayload(payload, context)).toThrow();
  });
  it('does not mistake safe composites for nested relations', () => {
    expect(() =>
      validateConditionalUpdatePayload(
        {
          text: 'value',
          currency: { amountMicros: 100, currencyCode: 'USD' },
          full_name: { firstName: 'Ada' },
          address: { addressCity: 'Paris' },
        },
        context,
      ),
    ).not.toThrow();
  });
});
