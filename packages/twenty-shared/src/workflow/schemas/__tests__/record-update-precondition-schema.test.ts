import { recordUpdatePreconditionSchema } from '../record-update-precondition-schema';

describe('recordUpdatePreconditionSchema', () => {
  it.each([{}, null, [], 'guard'])(
    'rejects a missing predicate: %p',
    (value) => {
      expect(recordUpdatePreconditionSchema.safeParse(value).success).toBe(
        false,
      );
    },
  );
  it('preserves predicates and workflow bindings for runtime metadata validation', () => {
    const value = {
      and: [
        { guard: { eq: '{{trigger.guard}}' } },
        { amount: { amountMicros: { gt: 0 } } },
      ],
    };
    expect(recordUpdatePreconditionSchema.parse(value)).toEqual(value);
  });
});
