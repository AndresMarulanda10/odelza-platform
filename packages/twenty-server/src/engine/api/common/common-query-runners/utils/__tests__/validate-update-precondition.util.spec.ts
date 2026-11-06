import { validateUpdatePrecondition } from '../validate-update-precondition.util';

describe('metadata-aware update preconditions', () => {
  const fields = [
    { id: 'guard', name: 'guard', type: 'UUID' },
    { id: 'amount', name: 'amount', type: 'CURRENCY' },
    { id: 'relation', name: 'relation', type: 'RELATION' },
  ];
  const context = {
    flatObjectMetadata: { id: 'widget', fieldIds: fields.map(({ id }) => id) },
    flatFieldMetadataMaps: {
      universalIdentifierById: Object.fromEntries(
        fields.map(({ id }) => [id, id]),
      ),
      byUniversalIdentifier: Object.fromEntries(
        fields.map((field) => [field.id, field]),
      ),
    },
  } as never;
  const permissions = {
    widget: { canReadObjectRecords: true, restrictedFields: {} },
  } as never;
  it.each([
    {},
    { and: [] },
    { or: [{}] },
    { not: {} },
    { unknown: { eq: 'x' } },
    { guard: {} },
    { guard: { injected: true } },
    { guard: { in: [] } },
    { guard: { is: 'NOT_NULL' } },
    { relation: { id: { eq: 'x' } } },
    { amount: { unknown: { eq: 1 } } },
  ])(
    'rejects empty, stripped, tautological and traversing predicates: %p',
    (value) => {
      expect(() =>
        validateUpdatePrecondition(value, context, permissions),
      ).toThrow();
    },
  );
  it('supports safe composite comparisons without relation traversal', () => {
    const value = {
      and: [
        { guard: { eq: 'token' } },
        { amount: { amountMicros: { gt: 0 } } },
      ],
    };
    expect(validateUpdatePrecondition(value, context, permissions)).toEqual(
      value,
    );
  });
  it('requires read access even when the caller can update the guard', () => {
    expect(() =>
      validateUpdatePrecondition({ guard: { eq: 'x' } }, context, {
        widget: {
          canReadObjectRecords: true,
          restrictedFields: { guard: { canRead: false, canUpdate: true } },
        },
      } as never),
    ).toThrow();
    expect(() =>
      validateUpdatePrecondition({ guard: { eq: 'x' } }, context, {}),
    ).toThrow();
  });
  it('applies the parent field read restriction to currency subfields', () => {
    expect(() =>
      validateUpdatePrecondition(
        { amount: { amountMicros: { eq: 1 } } },
        context,
        {
          widget: {
            canReadObjectRecords: true,
            restrictedFields: { amount: { canRead: false } },
          },
        } as never,
      ),
    ).toThrow();
  });
});
