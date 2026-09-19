import { type TaskTimelineItem } from 'twenty-shared/types';

import { TaskTimelineDateAdapter } from 'src/modules/task/timeline/adapters/task-timeline-date.adapter';
import {
  type TaskTimelineDateValue,
  type TaskTimelineFieldNames,
  type TaskTimelineRecord,
} from 'src/modules/task/timeline/types/task-timeline.types';

export class TaskTimelineFieldAdapter {
  constructor(
    public readonly fields: TaskTimelineFieldNames,
    public readonly dates: TaskTimelineDateAdapter,
  ) {}

  toItem(record: TaskTimelineRecord): TaskTimelineItem {
    const startDate = this.dates.normalizeDate(
      record[this.fields.startDate] as TaskTimelineDateValue,
    );
    const endDate = this.dates.normalizeDate(
      record[this.fields.endDate] as TaskTimelineDateValue,
    );
    const hasCompleteDateRange = startDate !== null && endDate !== null;

    if (hasCompleteDateRange) {
      this.dates.toFullDayRange(startDate, endDate);
    }

    return {
      id: record.id,
      title: this.readTitle(record[this.fields.title]),
      startDate: hasCompleteDateRange ? startDate : null,
      endDate: hasCompleteDateRange ? endDate : null,
      progress: this.readProgress(
        this.fields.progress === undefined
          ? undefined
          : record[this.fields.progress],
      ),
      isMilestone: this.readMilestone(
        this.fields.milestone === undefined
          ? undefined
          : record[this.fields.milestone],
      ),
      dependencies: [],
      conflict: false,
    };
  }

  toItems(records: TaskTimelineRecord[]): TaskTimelineItem[] {
    return records.map((record) => this.toItem(record));
  }

  private readTitle(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private readProgress(value: unknown): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
      throw new Error('Task timeline progress must be a number between 0 and 100');
    }

    return value;
  }

  private readMilestone(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value !== 'boolean') {
      throw new Error('Task timeline milestone must be a boolean');
    }

    return value;
  }
}
