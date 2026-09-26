import { getRecordFieldTextValue } from '@/object-record/utils/getRecordFieldTextValue';

describe('getRecordFieldTextValue', () => {
  it('returns a plain text value', () => {
    expect(getRecordFieldTextValue('Revisar propuesta')).toBe(
      'Revisar propuesta',
    );
  });

  it('returns nothing for empty values', () => {
    expect(getRecordFieldTextValue(null)).toBeUndefined();
    expect(getRecordFieldTextValue(undefined)).toBeUndefined();
    expect(getRecordFieldTextValue('')).toBeUndefined();
    expect(getRecordFieldTextValue('   ')).toBeUndefined();
  });

  it('returns numbers and booleans as text', () => {
    expect(getRecordFieldTextValue(12)).toBe('12');
    expect(getRecordFieldTextValue(true)).toBe('Sí');
    expect(getRecordFieldTextValue(false)).toBe('No');
  });

  it('prefers the visible label of a link', () => {
    expect(
      getRecordFieldTextValue({
        primaryLinkLabel: 'Documento',
        primaryLinkUrl: 'https://example.com/doc',
      }),
    ).toBe('Documento');
  });

  it('joins the two halves of a full name', () => {
    expect(
      getRecordFieldTextValue({ firstName: 'Ana', lastName: 'Gómez' }),
    ).toBe('Ana Gómez');
  });

  it('reads the text out of a rich text body', () => {
    expect(getRecordFieldTextValue({ markdown: 'Notas de la reunión' })).toBe(
      'Notas de la reunión',
    );
  });

  it('turns micros into a readable amount', () => {
    expect(getRecordFieldTextValue({ amountMicros: 1_500_000 })).toBe('1.5');
  });

  it('joins the values of a list', () => {
    expect(getRecordFieldTextValue(['uno', 'dos'])).toBe('uno, dos');
  });

  it('returns nothing for a value it cannot read', () => {
    expect(getRecordFieldTextValue({ unknownShape: true })).toBeUndefined();
  });
});
