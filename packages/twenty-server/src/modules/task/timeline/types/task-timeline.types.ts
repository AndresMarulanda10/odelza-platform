import {
  type TaskDependency,
  type TaskTimelineItem,
} from 'twenty-shared/types';

export type TaskTimelineDateValue = Date | string | null | undefined;

export type TaskTimelineRecord = {
  id: string;
  [fieldName: string]: unknown;
};

export type TaskTimelineFieldNames = {
  title?: string;
  startDate?: string;
  endDate?: string;
  progress?: string;
  status?: string;
  milestone?: string;
  dependency?: string;
  dependencyType?: string;
};

export type WorkspaceCalendarContext = {
  timeZone: string;
  calendarStartDay: number;
};

export type TaskTimelineDateRange = {
  startDate: string;
  endDate: string;
  startAt: Date;
  endAt: Date;
};

export type TaskTimelineDependencyInput = Pick<
  TaskDependency,
  'predecessorId' | 'successorId' | 'type'
>;

export type TaskTimelineDatePosition = {
  start: number;
  end: number;
  width: number;
};

export type TaskTimelineConflict = TaskTimelineDependencyInput & {
  predecessorEndDate: string;
  successorStartDate: string;
};

export type TaskTimelineEvaluation = {
  items: TaskTimelineItem[];
  dependencies: TaskDependency[];
  conflicts: TaskTimelineConflict[];
};

export type TaskTimelineEdit = {
  taskId: string;
  startDate?: TaskTimelineDateValue;
  endDate?: TaskTimelineDateValue;
  progress?: number | null;
};

export type TaskTimelineEditResult = TaskTimelineEvaluation & {
  updatedTaskId: string;
  automaticallyRescheduledTaskIds: string[];
};
