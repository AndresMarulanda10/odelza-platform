const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
export const TASK_TIMELINE_MINIMUM_VISIBLE_DAYS = 13;

export const normalizeTaskTimelineDate = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.length === 0) return null;

  const dateOnly = value.slice(0, 10);
  const match = DATE_ONLY_PATTERN.exec(dateOnly);
  if (match === null) return null;

  const timestamp = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  const date = new Date(timestamp);

  return Number.isFinite(timestamp) &&
    date.toISOString().slice(0, 10) === dateOnly
    ? dateOnly
    : null;
};

const padDatePart = (value: number): string => String(value).padStart(2, '0');

export const getTaskTimelineToday = (now = new Date()): string =>
  `${now.getFullYear()}-${padDatePart(now.getMonth() + 1)}-${padDatePart(now.getDate())}`;

const toUtcDay = (value: string | null): number | null => {
  if (value === null) return null;
  const normalized = normalizeTaskTimelineDate(value);
  if (normalized === null) return null;

  const match = DATE_ONLY_PATTERN.exec(normalized)!;
  return Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
};

export const getTaskTimelineDateBounds = (
  ...values: Array<string | null>
): { startDate: string; endDate: string } | null => {
  const days = values
    .map(toUtcDay)
    .filter((day): day is number => day !== null);
  if (days.length === 0) return null;

  return {
    startDate: new Date(Math.min(...days)).toISOString().slice(0, 10),
    endDate: new Date(Math.max(...days)).toISOString().slice(0, 10),
  };
};

export const getTaskTimelineVisibleBounds = ({
  today,
  taskEndDates,
  minimumVisibleDays = TASK_TIMELINE_MINIMUM_VISIBLE_DAYS,
}: {
  today: string;
  taskEndDates: Array<string | null>;
  minimumVisibleDays?: number;
}): { startDate: string; endDate: string } | null => {
  const normalizedToday = normalizeTaskTimelineDate(today);
  if (normalizedToday === null || minimumVisibleDays < 1) return null;

  const latestTaskEnd = getTaskTimelineDateBounds(...taskEndDates)?.endDate;
  const minimumEndDate = shiftTaskTimelineDate(
    normalizedToday,
    minimumVisibleDays - 1,
  );

  return {
    startDate: normalizedToday,
    endDate:
      latestTaskEnd && latestTaskEnd > minimumEndDate
        ? latestTaskEnd
        : minimumEndDate,
  };
};

export const shiftTaskTimelineDate = (
  value: string,
  dayOffset: number,
): string => {
  const day = toUtcDay(value);
  if (day === null || !Number.isInteger(dayOffset)) return value.slice(0, 10);

  return new Date(day + dayOffset * MILLISECONDS_PER_DAY)
    .toISOString()
    .slice(0, 10);
};

export const getTaskTimelineCalendarDates = (
  startDate: string | null,
  endDate: string | null,
): string[] => {
  const start = toUtcDay(startDate);
  const end = toUtcDay(endDate);
  if (start === null || end === null || start > end) return [];
  return Array.from(
    { length: Math.floor((end - start) / MILLISECONDS_PER_DAY) + 1 },
    (_, index) =>
      new Date(start + index * MILLISECONDS_PER_DAY).toISOString().slice(0, 10),
  );
};

export const getTaskTimelineCalendarSpan = ({
  taskStartDate,
  taskEndDate,
  timelineStartDate,
  timelineEndDate,
}: {
  taskStartDate: string | null;
  taskEndDate: string | null;
  timelineStartDate: string;
  timelineEndDate: string;
}): { startColumn: number; columnSpan: number } | null => {
  const taskDates = getTaskTimelineCalendarDates(taskStartDate, taskEndDate);
  const timelineDates = getTaskTimelineCalendarDates(
    timelineStartDate,
    timelineEndDate,
  );
  if (taskDates.length === 0 || timelineDates.length === 0) return null;
  const startColumn = timelineDates.indexOf(taskDates[0]) + 1;
  const endColumn = timelineDates.indexOf(taskDates[taskDates.length - 1]) + 1;
  return startColumn === 0 || endColumn === 0
    ? null
    : { startColumn, columnSpan: endColumn - startColumn + 1 };
};
