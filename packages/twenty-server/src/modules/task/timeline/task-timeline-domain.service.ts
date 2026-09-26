import { type TaskTimelineItem } from 'twenty-shared/types';

import { TaskTimelineDateAdapter } from 'src/modules/task/timeline/adapters/task-timeline-date.adapter';
import { TaskTimelineFieldAdapter } from 'src/modules/task/timeline/adapters/task-timeline-field.adapter';
import {
  type TaskTimelineDependencyInput,
  type TaskTimelineEdit,
  type TaskTimelineEditResult,
  type TaskTimelineEvaluation,
  type TaskTimelineRecord,
} from 'src/modules/task/timeline/types/task-timeline.types';

const timelineDateAdapter = new TaskTimelineDateAdapter({
  timeZone: 'UTC',
  calendarStartDay: 1,
});

export const validateTaskTimelineRecordUpdate = ({
  currentTask,
  update,
}: {
  currentTask: TaskTimelineRecord;
  update: TaskTimelineRecord;
}): void => {
  const hasTimelineUpdate = ['startDate', 'endDate', 'dueAt', 'progress'].some(
    (fieldName) => fieldName in update,
  );

  if (!hasTimelineUpdate) {
    return;
  }

  const progress = update.progress;

  if (
    progress !== undefined &&
    progress !== null &&
    (typeof progress !== 'number' ||
      !Number.isFinite(progress) ||
      progress < 0 ||
      progress > 100)
  ) {
    throw new Error(
      'Task timeline progress must be a number between 0 and 100',
    );
  }

  const startDate =
    'startDate' in update ? update.startDate : currentTask.startDate;
  const endDate =
    'endDate' in update
      ? update.endDate
      : 'dueAt' in update
        ? update.dueAt
        : (currentTask.endDate ?? currentTask.dueAt);

  if (startDate !== undefined || endDate !== undefined) {
    timelineDateAdapter.toFullDayRange(
      startDate as Parameters<TaskTimelineDateAdapter['normalizeDate']>[0],
      endDate as Parameters<TaskTimelineDateAdapter['normalizeDate']>[0],
    );
  }
};

export const evaluateTaskTimeline = ({
  items,
  dependencies,
}: {
  items: TaskTimelineItem[];
  dependencies: TaskTimelineDependencyInput[];
}): TaskTimelineEvaluation => {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const seenDependencies = new Set<string>();
  const conflicts = [] as TaskTimelineEvaluation['conflicts'];
  const conflictTaskIds = new Set<string>();

  const evaluatedDependencies = dependencies.map((dependency) => {
    if (dependency.type !== 'FINISH_TO_START') {
      throw new Error(
        `Unsupported task timeline dependency type: ${dependency.type}`,
      );
    }

    if (dependency.predecessorId === dependency.successorId) {
      throw new Error('A task timeline dependency cannot reference itself');
    }

    if (
      !itemsById.has(dependency.predecessorId) ||
      !itemsById.has(dependency.successorId)
    ) {
      throw new Error(
        'A task timeline dependency must reference visible tasks',
      );
    }

    const dependencyKey = `${dependency.predecessorId}:${dependency.successorId}`;

    if (seenDependencies.has(dependencyKey)) {
      throw new Error('Duplicate task timeline dependencies are not allowed');
    }

    seenDependencies.add(dependencyKey);

    const predecessor = itemsById.get(dependency.predecessorId);
    const successor = itemsById.get(dependency.successorId);
    let conflict = false;

    if (predecessor?.endDate != null && successor?.startDate != null) {
      conflict = successor.startDate <= predecessor.endDate;

      if (conflict) {
        conflicts.push({
          ...dependency,
          predecessorEndDate: predecessor.endDate,
          successorStartDate: successor.startDate,
        });
        conflictTaskIds.add(dependency.predecessorId);
        conflictTaskIds.add(dependency.successorId);
      }
    }

    return { ...dependency, conflict };
  });

  return {
    items: items.map((item) => ({
      ...item,
      dependencies: evaluatedDependencies.filter(
        (dependency) => dependency.successorId === item.id,
      ),
      conflict: conflictTaskIds.has(item.id),
    })),
    dependencies: evaluatedDependencies,
    conflicts,
  };
};

export const applyTaskTimelineEdit = ({
  evaluation,
  update,
  dates,
}: {
  evaluation: TaskTimelineEvaluation;
  update: TaskTimelineEdit;
  dates: TaskTimelineDateAdapter;
}): TaskTimelineEditResult => {
  const task = evaluation.items.find((item) => item.id === update.taskId);

  if (!task) {
    throw new Error(`Task timeline task not found: ${update.taskId}`);
  }

  if (
    update.progress !== undefined &&
    update.progress !== null &&
    (!Number.isFinite(update.progress) ||
      update.progress < 0 ||
      update.progress > 100)
  ) {
    throw new Error(
      'Task timeline progress must be a number between 0 and 100',
    );
  }

  const nextStartDate =
    update.startDate === undefined
      ? task.startDate
      : dates.normalizeDate(update.startDate);
  const nextEndDate =
    update.endDate === undefined
      ? task.endDate
      : dates.normalizeDate(update.endDate);
  const range = dates.toFullDayRange(nextStartDate, nextEndDate);
  const hasCompleteDateRange = range !== null;

  const nextItems = evaluation.items.map((item) =>
    item.id === update.taskId
      ? {
          ...item,
          startDate: hasCompleteDateRange ? nextStartDate : null,
          endDate: hasCompleteDateRange ? nextEndDate : null,
          progress:
            update.progress === undefined ? item.progress : update.progress,
        }
      : item,
  );
  const nextEvaluation = evaluateTaskTimeline({
    items: nextItems,
    dependencies: evaluation.dependencies,
  });

  return {
    ...nextEvaluation,
    updatedTaskId: update.taskId,
    automaticallyRescheduledTaskIds: [],
  };
};

export class TaskTimelineDomainService {
  constructor(private readonly fieldAdapter: TaskTimelineFieldAdapter) {}

  buildTimeline(
    records: TaskTimelineRecord[],
    dependencies = this.fieldAdapter.toDependencies(records),
  ): TaskTimelineEvaluation {
    return evaluateTaskTimeline({
      items: this.fieldAdapter.toItems(records),
      dependencies,
    });
  }

  applyEdit(
    evaluation: TaskTimelineEvaluation,
    update: TaskTimelineEdit,
  ): TaskTimelineEditResult {
    return applyTaskTimelineEdit({
      evaluation,
      update,
      dates: this.fieldAdapter.dates,
    });
  }
}
