import { getOverdueCalendarDays } from '@/page-layout/widgets/record-table/utils/getOverdueCalendarDays';
import { Temporal } from 'temporal-polyfill';

describe('overdue calendar-day display', () => {
  it.each([
    ['2026-03-08T05:00:00Z', '2026-03-09T04:00:00Z', 'America/New_York', 1],
    ['2026-11-01T04:00:00Z', '2026-11-02T05:00:00Z', 'America/New_York', 1],
    ['2026-10-14T03:59:00Z', '2026-10-14T04:00:00Z', 'America/New_York', 1],
    ['2026-10-13T23:59:00Z', '2026-10-14T00:00:00Z', 'UTC', 1],
    ['2026-10-14T00:00:00Z', '2026-10-14T23:59:00Z', 'UTC', null],
    ['2026-10-15T00:00:00Z', '2026-10-14T00:00:00Z', 'UTC', null],
  ])('%s → %s in %s', (dueAt, now, zone, expected) => {
    expect(
      getOverdueCalendarDays(dueAt, zone, Temporal.Instant.from(now)),
    ).toBe(expected);
  });
  it.each([null, undefined, '', 'bad date', 123])(
    'does not manufacture a badge for %s',
    (dueAt) => {
      expect(getOverdueCalendarDays(dueAt, 'UTC')).toBeNull();
    },
  );
  it('fails safely for an invalid zone', () =>
    expect(
      getOverdueCalendarDays('2026-10-13T00:00:00Z', 'invalid'),
    ).toBeNull());
});
