import {
  type TaskTimelineDateRange,
  type TaskTimelineDatePosition,
  type TaskTimelineDateValue,
  type WorkspaceCalendarContext,
} from 'src/modules/task/timeline/types/task-timeline.types';

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATE_TIME_WITH_ZONE_PATTERN = /(?:Z|[+-]\d{2}:\d{2})$/;
const VALID_CALENDAR_START_DAYS = new Set([0, 1, 6]);

export class TaskTimelineDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskTimelineDateError';
  }
}

export const calculateTaskTimelineDatePosition = ({
  taskRange,
  timelineRange,
}: {
  taskRange: TaskTimelineDateRange;
  timelineRange: TaskTimelineDateRange;
}): TaskTimelineDatePosition | null => {
  const timelineStart = timelineRange.startAt.getTime();
  const timelineEndExclusive = timelineRange.endAt.getTime() + 1;
  const taskStart = taskRange.startAt.getTime();
  const taskEndExclusive = taskRange.endAt.getTime() + 1;

  if (taskEndExclusive <= timelineStart || taskStart >= timelineEndExclusive) {
    return null;
  }

  const start = Math.max(taskStart, timelineStart);
  const end = Math.min(taskEndExclusive, timelineEndExclusive);
  const totalDuration = timelineEndExclusive - timelineStart;
  const startPosition = (start - timelineStart) / totalDuration;
  const endPosition = (end - timelineStart) / totalDuration;

  return {
    start: startPosition,
    end: endPosition,
    width: endPosition - startPosition,
  };
};

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
};

export class TaskTimelineDateAdapter {
  private readonly dateFormatter: Intl.DateTimeFormat;

  constructor(public readonly calendar: WorkspaceCalendarContext) {
    if (!calendar.timeZone || !calendar.timeZone.trim()) {
      throw new TaskTimelineDateError('A workspace time zone is required');
    }

    if (!VALID_CALENDAR_START_DAYS.has(calendar.calendarStartDay)) {
      throw new TaskTimelineDateError(
        'The workspace calendar start day must be Sunday, Monday, or Saturday',
      );
    }

    try {
      this.dateFormatter = new Intl.DateTimeFormat('en-US', {
        calendar: 'gregory',
        numberingSystem: 'latn',
        timeZone: calendar.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      });
    } catch {
      throw new TaskTimelineDateError(
        `Invalid workspace time zone: ${calendar.timeZone}`,
      );
    }
  }

  normalizeDate(value: TaskTimelineDateValue): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      const dateOnlyMatch = DATE_ONLY_PATTERN.exec(value);

      if (dateOnlyMatch) {
        this.assertValidDateOnly(value, dateOnlyMatch);
        return value;
      }

      if (!ISO_DATE_TIME_WITH_ZONE_PATTERN.test(value)) {
        throw new TaskTimelineDateError(
          'Date-time task fields must include an explicit time zone',
        );
      }

      const parsedDate = new Date(value);

      if (Number.isNaN(parsedDate.getTime())) {
        throw new TaskTimelineDateError(`Invalid task date: ${value}`);
      }

      return this.formatDateOnly(parsedDate);
    }

    if (!(value instanceof Date)) {
      throw new TaskTimelineDateError('Task dates must be Date or ISO strings');
    }

    if (Number.isNaN(value.getTime())) {
      throw new TaskTimelineDateError('Invalid task date');
    }

    return this.formatDateOnly(value);
  }

  toFullDayRange(
    startValue: TaskTimelineDateValue,
    endValue: TaskTimelineDateValue,
  ): TaskTimelineDateRange | null {
    const startDate = this.normalizeDate(startValue);
    const endDate = this.normalizeDate(endValue);

    if (startDate === null || endDate === null) {
      return null;
    }

    if (startDate > endDate) {
      throw new TaskTimelineDateError(
        'A task start date cannot be after its inclusive end date',
      );
    }

    return {
      startDate,
      endDate,
      startAt: this.toWorkspaceDate(startDate, 0, 0, 0, 0),
      endAt: this.toWorkspaceDate(endDate, 23, 59, 59, 999),
    };
  }

  getDatePosition({
    taskStartDate,
    taskEndDate,
    timelineStartDate,
    timelineEndDate,
  }: {
    taskStartDate: TaskTimelineDateValue;
    taskEndDate: TaskTimelineDateValue;
    timelineStartDate: TaskTimelineDateValue;
    timelineEndDate: TaskTimelineDateValue;
  }): TaskTimelineDatePosition | null {
    const taskRange = this.toFullDayRange(taskStartDate, taskEndDate);
    const timelineRange = this.toFullDayRange(
      timelineStartDate,
      timelineEndDate,
    );

    if (taskRange === null || timelineRange === null) {
      return null;
    }

    return calculateTaskTimelineDatePosition({ taskRange, timelineRange });
  }

  private formatDateOnly(value: Date): string {
    const parts = this.getDateParts(value);

    return [parts.year, parts.month, parts.day]
      .map((part, index) =>
        index === 0 ? String(part) : String(part).padStart(2, '0'),
      )
      .join('-');
  }

  private getDateParts(value: Date): DateParts {
    const parts = this.dateFormatter.formatToParts(value);
    const values = new Map(
      parts
        .filter(({ type }) => type !== 'literal')
        .map(({ type, value: partValue }) => [type, Number(partValue)]),
    );

    return {
      year: values.get('year') ?? 0,
      month: values.get('month') ?? 0,
      day: values.get('day') ?? 0,
      hour: values.get('hour'),
      minute: values.get('minute'),
      second: values.get('second'),
    };
  }

  private toWorkspaceDate(
    dateOnly: string,
    hour: number,
    minute: number,
    second: number,
    millisecond: number,
  ): Date {
    const match = DATE_ONLY_PATTERN.exec(dateOnly);

    if (!match) {
      throw new TaskTimelineDateError(
        `Invalid normalized task date: ${dateOnly}`,
      );
    }

    const [, year, month, day] = match.map(Number);
    const wallClock = this.createUtcDate({
      year,
      month,
      day,
      hour,
      minute,
      second,
    });
    let utcTimestamp = wallClock.getTime() - this.getTimeZoneOffset(wallClock);

    for (let attempt = 0; attempt < 3; attempt++) {
      const nextUtcTimestamp =
        wallClock.getTime() +
        millisecond -
        this.getTimeZoneOffset(new Date(utcTimestamp));

      if (nextUtcTimestamp === utcTimestamp) {
        break;
      }

      utcTimestamp = nextUtcTimestamp;
    }

    return new Date(utcTimestamp);
  }

  private getTimeZoneOffset(value: Date): number {
    const valueAtSecond = new Date(Math.floor(value.getTime() / 1000) * 1000);
    const parts = this.getDateParts(valueAtSecond);
    const localTime = this.createUtcDate({
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: parts.hour,
      minute: parts.minute,
      second: parts.second,
    });

    return localTime.getTime() - valueAtSecond.getTime();
  }

  private assertValidDateOnly(value: string, match: RegExpExecArray): void {
    const [, yearText, monthText, dayText] = match;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    if (month < 1 || month > 12 || day < 1 || day > daysInMonth) {
      throw new TaskTimelineDateError(`Invalid task date: ${value}`);
    }
  }

  private createUtcDate(parts: DateParts): Date {
    const value = new Date(0);
    value.setUTCFullYear(parts.year, parts.month - 1, parts.day);
    value.setUTCHours(parts.hour ?? 0, parts.minute ?? 0, parts.second ?? 0, 0);
    return value;
  }
}
