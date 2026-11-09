import { generateConditionalUpdateRecordInputSchema } from '../generate-conditional-update-record-input-schema.util';
import { generateUpdateRecordInputSchema } from '../generate-update-record-input-schema.util';

describe('separate conditional update tool schema', () => {
  const id = '06c544bb-0122-4672-8041-dbc59fa5d4f4';
  const fields = [
    { id: 'id', name: 'id', type: 'UUID' },
    ...['data', 'precondition', 'name'].map((name) => ({
      id: name,
      name,
      type: 'TEXT',
      isNullable: true,
    })),
    { id: 'files', name: 'files', type: 'FILES', isNullable: true },
    { id: 'amount', name: 'amount', type: 'CURRENCY', isNullable: true },
  ];
  const metadata = { fields } as never;
  const schema = generateConditionalUpdateRecordInputSchema(metadata);
  it('allows legitimate data/precondition fields inside data, not as mode flags', () => {
    const input = {
      id,
      data: { data: 'custom', precondition: 'custom' },
      precondition: { name: { eq: 'old' } },
    };
    expect(schema.parse(input)).toEqual(input);
    expect(
      generateUpdateRecordInputSchema(metadata).parse({
        id,
        data: 'flat',
        precondition: 'flat',
      }),
    ).toEqual({ id, data: 'flat', precondition: 'flat' });
  });
  it.each([
    { id, data: { name: 'x' } },
    { id, data: { files: [] }, precondition: { name: { eq: 'old' } } },
    { id, data: { id }, precondition: { name: { eq: 'old' } } },
    { id, data: { name: 'x' }, precondition: {}, updateMode: 'conditional' },
  ])('rejects unsupported or malformed envelopes: %p', (input) => {
    expect(schema.safeParse(input).success).toBe(false);
  });
  it('does not advertise update-restricted fields', () => {
    const restricted = generateConditionalUpdateRecordInputSchema(metadata, {
      name: { canUpdate: false },
    });
    expect(
      restricted.safeParse({
        id,
        data: { name: 'x' },
        precondition: { name: { eq: 'old' } },
      }).success,
    ).toBe(false);
  });
});
