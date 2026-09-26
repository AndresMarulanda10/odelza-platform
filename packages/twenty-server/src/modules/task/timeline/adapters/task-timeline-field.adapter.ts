import { type TaskTimelineItem } from 'twenty-shared/types';

import { TaskTimelineDateAdapter } from 'src/modules/task/timeline/adapters/task-timeline-date.adapter';
import {
  type TaskTimelineDependencyInput,
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
    const startDate =
      this.fields.startDate === undefined
        ? null
        : this.dates.normalizeDate(
            record[this.fields.startDate] as TaskTimelineDateValue,
          );
    const endDate =
      this.fields.endDate === undefined
        ? null
        : this.dates.normalizeDate(
            record[this.fields.endDate] as TaskTimelineDateValue,
          );
    const hasCompleteDateRange = startDate !== null && endDate !== null;

    if (hasCompleteDateRange) {
      this.dates.toFullDayRange(startDate, endDate);
    }

    return {
      id: record.id,
      title:
        this.fields.title === undefined
          ? ''
          : this.readTitle(record[this.fields.title]),
      startDate: hasCompleteDateRange ? startDate : null,
      endDate: hasCompleteDateRange ? endDate : null,
      progress: this.readProgress(
        this.fields.progress === undefined
          ? undefined
          : record[this.fields.progress],
        this.fields.status === undefined
          ? undefined
          : record[this.fields.status],
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

  toDependencies(records: TaskTimelineRecord[]): TaskTimelineDependencyInput[] {
    const dependencyField = this.fields.dependency;

    if (dependencyField === undefined) {
      return [];
    }

    return records.flatMap((record) => {
      const dependencyType =
        this.fields.dependencyType === undefined
          ? 'FINISH_TO_START'
          : record[this.fields.dependencyType];

      if (
        dependencyType !== undefined &&
        dependencyType !== null &&
        dependencyType !== 'FINISH_TO_START'
      ) {
        throw new Error(
          `Unsupported task timeline dependency type: ${String(dependencyType)}`,
        );
      }

      return this.readDependencyIds(record[dependencyField]).map(
        (predecessorId) => ({
          predecessorId,
          successorId: record.id,
          type: 'FINISH_TO_START' as const,
        }),
      );
    });
  }

  private readTitle(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private readProgress(value: unknown, status: unknown): number | null {
    if (value === null || value === undefined) {
      return this.readStatusProgress(status);
    }

    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 100
    ) {
      return null;
    }

    return value;
  }

  private readStatusProgress(status: unknown): number | null {
    if (typeof status !== 'string') {
      return null;
    }

    return status === 'DONE' ? 100 : 0;
  }

  private readDependencyIds(value: unknown): string[] {
    const values = Array.isArray(value) ? value : [value];

    return values.flatMap((dependency) => {
      if (typeof dependency === 'string') {
        return [dependency];
      }

      if (typeof dependency !== 'object' || dependency === null) {
        return [];
      }

      const dependencyRecord = dependency as {
        id?: unknown;
        predecessorId?: unknown;
      };
      const id = dependencyRecord.predecessorId ?? dependencyRecord.id;

      return typeof id === 'string' ? [id] : [];
    });
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
