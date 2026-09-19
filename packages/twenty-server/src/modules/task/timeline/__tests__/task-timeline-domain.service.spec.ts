import { type TaskTimelineItem } from 'twenty-shared/types';

import {
  TaskTimelineDateAdapter,
  TaskTimelineDateError,
} from 'src/modules/task/timeline/adapters/task-timeline-date.adapter';
import { TaskTimelineFieldAdapter } from 'src/modules/task/timeline/adapters/task-timeline-field.adapter';
import {
  applyTaskTimelineEdit,
  evaluateTaskTimeline,
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
    milestone: false,
  },
  {
    id: 'successor',
    name: 'Build',
    plannedStart: '2024-03-10',
    plannedEnd: '2024-03-12',
    completion: 0,
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
    expect(evaluation.items.map(({ id, conflict }) => ({ id, conflict }))).toEqual([
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
});
