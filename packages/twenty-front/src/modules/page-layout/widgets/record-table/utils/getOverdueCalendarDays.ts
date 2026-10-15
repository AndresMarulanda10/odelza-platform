import { Temporal } from 'temporal-polyfill';

// Display only: native server filters remain the source of membership in the list.
export const getOverdueCalendarDays = (
  dueAt: unknown,
  timeZone: string,
  now: Temporal.Instant = Temporal.Now.instant(),
): number | null => {
  if (typeof dueAt !== 'string') return null;
  try {
    const dueDate = Temporal.Instant.from(dueAt)
      .toZonedDateTimeISO(timeZone)
      .toPlainDate();
    const today = now.toZonedDateTimeISO(timeZone).toPlainDate();
    const days = dueDate.until(today, { largestUnit: 'days' }).days;
    return days > 0 ? days : null;
  } catch {
    return null;
  }
};
