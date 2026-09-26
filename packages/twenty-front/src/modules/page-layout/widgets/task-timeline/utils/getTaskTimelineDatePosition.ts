export type TaskTimelineDatePosition = {
  start: number;
  end: number;
  width: number;
};

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const toDateRange = (
  startDate: string | null,
  endDate: string | null,
): { start: number; endExclusive: number } | null => {
  if (startDate === null || endDate === null) {
    return null;
  }

  const startMatch = DATE_ONLY_PATTERN.exec(startDate.slice(0, 10));
  const endMatch = DATE_ONLY_PATTERN.exec(endDate.slice(0, 10));

  if (startMatch === null || endMatch === null) {
    return null;
  }

  const start = Date.UTC(
    Number(startMatch[1]),
    Number(startMatch[2]) - 1,
    Number(startMatch[3]),
  );
  const end = Date.UTC(
    Number(endMatch[1]),
    Number(endMatch[2]) - 1,
    Number(endMatch[3]),
  );

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
    return null;
  }

  return { start, endExclusive: end + MILLISECONDS_PER_DAY };
};

export const getTaskTimelineDatePosition = ({
  taskStartDate,
  taskEndDate,
  timelineStartDate,
  timelineEndDate,
}: {
  taskStartDate: string | null;
  taskEndDate: string | null;
  timelineStartDate: string | null;
  timelineEndDate: string | null;
}): TaskTimelineDatePosition | null => {
  const taskRange = toDateRange(taskStartDate, taskEndDate);
  const timelineRange = toDateRange(timelineStartDate, timelineEndDate);

  if (taskRange === null || timelineRange === null) {
    return null;
  }

  if (
    taskRange.endExclusive <= timelineRange.start ||
    taskRange.start >= timelineRange.endExclusive
  ) {
    return null;
  }

  const start = Math.max(taskRange.start, timelineRange.start);
  const end = Math.min(taskRange.endExclusive, timelineRange.endExclusive);
  const totalDuration = timelineRange.endExclusive - timelineRange.start;
  const startPosition = (start - timelineRange.start) / totalDuration;
  const endPosition = (end - timelineRange.start) / totalDuration;

  return {
    start: startPosition,
    end: endPosition,
    width: endPosition - startPosition,
  };
};
