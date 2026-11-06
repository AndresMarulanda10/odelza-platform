import { parseWorkflowPaginationInput } from '../parse-workflow-pagination-input.util';

describe('resolved workflow pagination', () => {
  it('preserves omitted limit and zero offset defaults', () => {
    expect(parseWorkflowPaginationInput({})).toEqual({
      limit: undefined,
      offset: 0,
      after: undefined,
    });
  });
  it('accepts strict numeric strings from bindings and caps page size', () => {
    expect(
      parseWorkflowPaginationInput({ limit: '401', offset: '200' }),
    ).toMatchObject({ limit: 200, offset: 200 });
  });
  it.each([
    NaN,
    Infinity,
    -1,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
    '',
    ' ',
    '1e2',
    '1.5',
    '-1',
    '200,400',
    [],
    [200],
    {},
    null,
    'text',
  ])('rejects unsafe resolved offset %p', (offset) => {
    expect(() => parseWorkflowPaginationInput({ offset })).toThrow();
  });
  it.each([0, '0', null, ' 10', true])(
    'rejects invalid resolved limit %p',
    (limit) => {
      expect(() => parseWorkflowPaginationInput({ limit })).toThrow();
    },
  );
  it('rejects ambiguous cursor and offset', () => {
    expect(() =>
      parseWorkflowPaginationInput({ after: 'cursor', offset: '1' }),
    ).toThrow();
  });
});
