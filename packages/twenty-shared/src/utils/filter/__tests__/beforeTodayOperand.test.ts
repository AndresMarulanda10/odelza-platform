import { Temporal } from 'temporal-polyfill';
import { FieldMetadataType, ViewFilterOperand } from '@/types';
import { FILTER_OPERANDS_MAP } from '@/utils/filter/utils/filterOperandsMap';
import { convertViewFilterOperandToCoreOperand } from '@/utils/filter/utils/convert-view-filter-operand-to-core-operand.util';
import { isRecordFilterOperandExpectingValue } from '@/utils/filter/isRecordFilterOperandExpectingValue';
import { isRecordFilterValueValid } from '@/utils/filter/isRecordFilterValueValid';
import { turnRecordFilterIntoRecordGqlOperationFilter } from '@/utils/filter/turnRecordFilterIntoGqlOperationFilter';

describe('IS_BEFORE_TODAY native operand', () => {
  afterEach(() => jest.restoreAllMocks());
  const query = (
    timeZone: string,
    type = FieldMetadataType.DATE_TIME,
    operand = ViewFilterOperand.IS_BEFORE_TODAY,
  ) =>
    turnRecordFilterIntoRecordGqlOperationFilter({
      filterValueDependencies: { timeZone },
      fieldMetadataItemById: new Map([
        ['due', { id: 'due', name: 'dueAt', type, label: 'Due' }],
      ]),
      recordFilter: {
        fieldMetadataId: 'due',
        type: 'DATE_TIME',
        operand,
        value: '',
      },
    });

  it.each([
    ['UTC', '2026-10-14T16:00:00Z', '2026-10-14T00:00:00Z'],
    ['America/New_York', '2026-03-08T16:00:00Z', '2026-03-08T05:00:00Z'],
    ['America/New_York', '2026-11-01T17:00:00Z', '2026-11-01T04:00:00Z'],
    ['Asia/Tokyo', '2026-10-14T02:00:00Z', '2026-10-13T15:00:00Z'],
  ])('uses local midnight in %s at %s', (zone, instant, expected) => {
    jest
      .spyOn(Temporal.Now, 'zonedDateTimeISO')
      .mockReturnValue(Temporal.Instant.from(instant).toZonedDateTimeISO(zone));
    expect(query(zone)).toEqual({ dueAt: { lt: expected } });
    const before = (value: string) =>
      Temporal.Instant.compare(
        Temporal.Instant.from(value),
        Temporal.Instant.from(expected),
      ) < 0;
    expect(before(expected)).toBe(false);
    expect(before(instant)).toBe(false);
    expect(
      before(
        Temporal.Instant.from(expected).subtract({ nanoseconds: 1 }).toString(),
      ),
    ).toBe(true);
  });

  it.each([
    ['2026-03-08', 23],
    ['2026-11-01', 25],
  ])('recomputes across a %s DST day (%s hours)', (date, hours) => {
    const start =
      Temporal.PlainDate.from(date).toZonedDateTime('America/New_York');
    const now = jest
      .spyOn(Temporal.Now, 'zonedDateTimeISO')
      .mockReturnValue(start.add({ hours: 12 }));
    expect(query('America/New_York')).toEqual({
      dueAt: { lt: start.toInstant().toString() },
    });
    now.mockReturnValue(start.add({ days: 1, hours: 12 }));
    expect(query('America/New_York')).toEqual({
      dueAt: { lt: start.add({ days: 1 }).toInstant().toString() },
    });
    expect(
      start.until(start.add({ days: 1 }), { largestUnit: 'hours' }).hours,
    ).toBe(hours);
  });

  it('remains valueless and converts its persisted identity', () => {
    expect(
      isRecordFilterOperandExpectingValue(ViewFilterOperand.IS_BEFORE_TODAY),
    ).toBe(false);
    expect(
      isRecordFilterValueValid({
        operand: ViewFilterOperand.IS_BEFORE_TODAY,
        value: '',
      }),
    ).toBe(true);
    expect(convertViewFilterOperandToCoreOperand('IS_BEFORE_TODAY')).toBe(
      ViewFilterOperand.IS_BEFORE_TODAY,
    );
    expect(
      Object.entries(FILTER_OPERANDS_MAP)
        .filter(([, operands]) =>
          (operands as readonly ViewFilterOperand[]).includes(
            ViewFilterOperand.IS_BEFORE_TODAY,
          ),
        )
        .map(([type]) => type),
    ).toEqual(['DATE_TIME']);
  });

  it.each([
    FieldMetadataType.DATE,
    FieldMetadataType.TEXT,
    FieldMetadataType.NUMBER,
  ])('rejects %s metadata', (type) => {
    expect(() => query('UTC', type)).toThrow('requires a DATE_TIME field');
  });

  it('does not change legacy before-now semantics', () => {
    jest
      .spyOn(Temporal.Now, 'zonedDateTimeISO')
      .mockReturnValue(
        Temporal.Instant.from('2026-10-14T16:00:00Z').toZonedDateTimeISO('UTC'),
      );
    expect(
      query('UTC', FieldMetadataType.DATE_TIME, ViewFilterOperand.IS_IN_PAST),
    ).toEqual({ dueAt: { lt: '2026-10-14T16:00:00Z' } });
  });
});
