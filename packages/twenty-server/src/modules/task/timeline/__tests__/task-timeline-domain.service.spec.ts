import { type TaskTimelineItem } from 'twenty-shared/types';

import {
  TaskTimelineDateAdapter,
  TaskTimelineDateError,
} from 'src/modules/task/timeline/adapters/task-timeline-date.adapter';
import { TaskTimelineFieldAdapter } from 'src/modules/task/timeline/adapters/task-timeline-field.adapter';
import {
  applyTaskTimelineEdit,
  evaluateTaskTimeline,
  validateTaskTimelineRecordUpdate,
} from 'src/modules/task/timeline/task-timeline-domain.service';
import {
  type TaskTimelineEvaluation,
  type TaskTimelineRecord,
} from 'src/modules/task/timeline/types/task-timeline.types';

const dateAdapter = new TaskTimelineDateAdapter({
  timeZone: 'America/New_York',
  calendarStartDay: 1,
});

const fieldAdapter = new TaskTimelineFieldAdapter(
  {
    title: 'name',
    startDate: 'plannedStart',
    endDate: 'plannedEnd',
    progress: 'completion',
    status: 'state',
    milestone: 'milestone',
  },
  dateAdapter,
);

const taskRecords: TaskTimelineRecord[] = [
  {
    id: 'predecessor',
    name: 'Design',
    plannedStart: '2024-03-09',
    plannedEnd: '2024-03-10',
    completion: 50,
    state: 'IN_PROGRESS',
    milestone: false,
  },
  {
    id: 'successor',
    name: 'Build',
    plannedStart: '2024-03-10',
    plannedEnd: '2024-03-12',
    completion: 0,
    state: 'TODO',
    milestone: false,
  },
];

const dependency = {
  predecessorId: 'predecessor',
  successorId: 'successor',
  type: 'FINISH_TO_START' as const,
};

const buildEvaluation = (): TaskTimelineEvaluation =>
  evaluateTaskTimeline({
    items: fieldAdapter.toItems(taskRecords),
    dependencies: [dependency],
  });

describe('Task timeline domain behavior', () => {
  it('keeps inclusive full-day boundaries in the workspace timezone across DST', () => {
    const range = dateAdapter.toFullDayRange('2024-03-10', '2024-03-10');

    expect(range?.startAt.toISOString()).toBe('2024-03-10T05:00:00.000Z');
    expect(range?.endAt.toISOString()).toBe('2024-03-11T03:59:59.999Z');
  });

  it('uses explicit task fields and represents incomplete dates as unpositionable', () => {
    const item = fieldAdapter.toItem({
      id: 'missing-date',
      name: 'Unscheduled',
      plannedStart: '2024-03-10',
      plannedEnd: null,
      completion: null,
      milestone: true,
    });

    expect(item).toMatchObject({
      id: 'missing-date',
      title: 'Unscheduled',
      startDate: null,
      endDate: null,
      progress: null,
      isMilestone: true,
    });
  });

  it('maps completed and non-completed statuses only when progress is absent', () => {
    const statusOnlyAdapter = new TaskTimelineFieldAdapter(
      {
        title: 'name',
        startDate: 'plannedStart',
        endDate: 'plannedEnd',
        progress: 'completion',
        status: 'state',
        milestone: 'milestone',
      },
      dateAdapter,
    );

    expect(
      statusOnlyAdapter.toItem({
        id: 'done',
        name: 'Done',
        plannedStart: '2024-03-10',
        plannedEnd: '2024-03-10',
        completion: null,
        state: 'DONE',
        milestone: false,
      }).progress,
    ).toBe(100);
    expect(
      statusOnlyAdapter.toItem({
        id: 'todo',
        name: 'To do',
        plannedStart: '2024-03-10',
        plannedEnd: '2024-03-10',
        completion: undefined,
        state: 'TODO',
        milestone: false,
      }).progress,
    ).toBe(0);
    expect(
      statusOnlyAdapter.toItem({
        id: 'explicit',
        name: 'Explicit',
        plannedStart: '2024-03-10',
        plannedEnd: '2024-03-10',
        completion: 25,
        state: 'DONE',
        milestone: false,
      }).progress,
    ).toBe(25);
    expect(
      statusOnlyAdapter.toItem({
        id: 'invalid',
        name: 'Invalid',
        plannedStart: '2024-03-10',
        plannedEnd: '2024-03-10',
        completion: 101,
        state: 'DONE',
        milestone: false,
      }).progress,
    ).toBeNull();
  });

  it('keeps progress unavailable when both optional progress and status mappings are absent', () => {
    const missingMappingAdapter = new TaskTimelineFieldAdapter(
      {
        title: 'name',
        startDate: 'plannedStart',
        endDate: 'plannedEnd',
      },
      dateAdapter,
    );

    expect(
      missingMappingAdapter.toItem({
        id: 'missing-mapping',
        name: 'Missing mapping',
        plannedStart: '2024-03-10',
        plannedEnd: '2024-03-10',
      }).progress,
    ).toBeNull();
  });

  it('converts configured dependency relations to finish-to-start links', () => {
    const dependencyAdapter = new TaskTimelineFieldAdapter(
      {
        title: 'name',
        startDate: 'plannedStart',
        endDate: 'plannedEnd',
        dependency: 'blockedBy',
        dependencyType: 'dependencyType',
      },
      dateAdapter,
    );

    expect(
      dependencyAdapter.toDependencies([
        {
          id: 'successor',
          blockedBy: { id: 'predecessor' },
          dependencyType: 'FINISH_TO_START',
        },
      ]),
    ).toEqual([
      {
        predecessorId: 'predecessor',
        successorId: 'successor',
        type: 'FINISH_TO_START',
      },
    ]);
  });

  it('positions an inclusive task range across full-day workspace boundaries', () => {
    expect(
      dateAdapter.getDatePosition({
        taskStartDate: '2024-03-10',
        taskEndDate: '2024-03-12',
        timelineStartDate: '2024-03-10',
        timelineEndDate: '2024-03-12',
      }),
    ).toEqual({ start: 0, end: 1, width: 1 });
    expect(
      dateAdapter.getDatePosition({
        taskStartDate: '2024-03-10',
        taskEndDate: null,
        timelineStartDate: '2024-03-10',
        timelineEndDate: '2024-03-12',
      }),
    ).toBeNull();
  });

  it('marks a same-day finish-to-start violation without changing either task', () => {
    const evaluation = buildEvaluation();

    expect(evaluation.conflicts).toEqual([
      {
        ...dependency,
        predecessorEndDate: '2024-03-10',
        successorStartDate: '2024-03-10',
      },
    ]);
    expect(evaluation.dependencies[0].conflict).toBe(true);
    expect(
      evaluation.items.map(({ id, conflict }) => ({ id, conflict })),
    ).toEqual([
      { id: 'predecessor', conflict: true },
      { id: 'successor', conflict: true },
    ]);
  });

  it('validates an edit and never automatically reschedules a dependent task', () => {
    const evaluation = buildEvaluation();
    const result = applyTaskTimelineEdit({
      evaluation,
      dates: dateAdapter,
      update: {
        taskId: 'predecessor',
        endDate: '2024-03-11',
      },
    });

    expect(result.automaticallyRescheduledTaskIds).toEqual([]);
    expect(result.updatedTaskId).toBe('predecessor');
    expect(result.items.find(({ id }) => id === 'successor')).toMatchObject({
      startDate: '2024-03-10',
      endDate: '2024-03-12',
    });
    expect(result.conflicts[0]).toMatchObject({
      predecessorEndDate: '2024-03-11',
      successorStartDate: '2024-03-10',
    });
  });

  it('rejects reversed full-day ranges instead of mutating a task', () => {
    const evaluation = buildEvaluation();
    const taskItems = evaluation.items as TaskTimelineItem[];

    expect(() =>
      applyTaskTimelineEdit({
        evaluation: { ...evaluation, items: taskItems },
        dates: dateAdapter,
        update: {
          taskId: 'predecessor',
          startDate: '2024-03-12',
          endDate: '2024-03-11',
        },
      }),
    ).toThrow(TaskTimelineDateError);
  });

  it('rejects persisted task mutations that put the start after the due date', () => {
    expect(() =>
      validateTaskTimelineRecordUpdate({
        currentTask: {
          id: 'task',
          startDate: '2024-03-10',
          dueAt: '2024-03-12',
        },
        update: { id: 'task', dueAt: '2024-03-09' },
      }),
    ).toThrow('A task start date cannot be after its inclusive end date');
  });

  it('accepts persisted progress mutations only in the inclusive range', () => {
    expect(() =>
      validateTaskTimelineRecordUpdate({
        currentTask: {
          id: 'task',
          startDate: '2024-03-10',
          dueAt: '2024-03-12',
        },
        update: { id: 'task', progress: 100 },
      }),
    ).not.toThrow();

    expect(() =>
      validateTaskTimelineRecordUpdate({
        currentTask: { id: 'task' },
        update: { id: 'task', progress: 101 },
      }),
    ).toThrow('Task timeline progress must be a number between 0 and 100');
  });
});
