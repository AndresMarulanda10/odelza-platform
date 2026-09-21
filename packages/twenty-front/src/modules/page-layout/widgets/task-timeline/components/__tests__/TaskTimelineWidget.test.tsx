import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { TaskTimelineWidget } from '@/page-layout/widgets/task-timeline/components/TaskTimelineWidget';
import { useTaskTimelineData } from '@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData';
import {
  getTaskTimelineCalendarDates,
  normalizeTaskTimelineDate,
  shiftTaskTimelineDate,
} from '@/page-layout/widgets/task-timeline/utils/getTaskTimelineCalendar';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';

jest.mock('@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData');
jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel');
jest.mock(
  '@/page-layout/widgets/task-timeline/utils/getTaskTimelineCalendar',
  () => ({
    ...jest.requireActual(
      '@/page-layout/widgets/task-timeline/utils/getTaskTimelineCalendar',
    ),
    getTaskTimelineToday: jest.fn(() => '2026-09-19'),
  }),
);

const mockedUseTaskTimelineData = jest.mocked(useTaskTimelineData);
const mockedUseOpenRecordInSidePanel = jest.mocked(useOpenRecordInSidePanel);
const openRecordInSidePanel = jest.fn();
const resolveTaskTimelineFieldNames = jest.requireActual<
  typeof import('@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData')
>(
  '@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData',
).resolveTaskTimelineFieldNames;
const getActualTaskTimelineToday = jest.requireActual<
  typeof import('@/page-layout/widgets/task-timeline/utils/getTaskTimelineCalendar')
>(
  '@/page-layout/widgets/task-timeline/utils/getTaskTimelineCalendar',
).getTaskTimelineToday;
const widget = { id: 'timeline-widget' } as PageLayoutWidget;

describe('TaskTimelineWidget', () => {
  beforeEach(() => {
    mockedUseTaskTimelineData.mockReset();
    mockedUseOpenRecordInSidePanel.mockReturnValue({
      openRecordInSidePanel,
    });
    openRecordInSidePanel.mockReset();
  });

  it('renders only the calendar for dated tasks at a narrow viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 320,
    });
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [
        {
          id: 'task-1',
          title: 'Release planning',
          startDate: '2026-09-19',
          endDate: null,
          progress: null,
          isMilestone: true,
          dependencies: [
            {
              predecessorId: 'task-0',
              successorId: 'task-1',
              type: 'FINISH_TO_START',
              conflict: true,
            },
          ],
          conflict: true,
        },
      ],
      hasConfigurationGap: false,
      retry: jest.fn(),
    });

    render(<TaskTimelineWidget widget={widget} />);

    expect(
      screen.getByRole('region', { name: 'Task timeline' }),
    ).toHaveTextContent('Dates are full-day and inclusive');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByText('Shown in the calendar above')).not.toBeInTheDocument();
    expect(screen.queryByText('Progress unavailable')).not.toBeInTheDocument();
    expect(screen.getByText('No dated tasks to display')).toBeVisible();
  });

  it('keeps retry available as a keyboard-safe control in the error state', () => {
    const retry = jest.fn();
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'error',
      items: [],
      hasConfigurationGap: false,
      error: new Error('Task source failed'),
      retry,
    });

    render(<TaskTimelineWidget widget={widget} />);

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    expect(retryButton).toHaveAttribute('type', 'button');
    fireEvent.click(retryButton);
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('renders the forbidden state without task data', () => {
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'forbidden',
      items: [],
      hasConfigurationGap: false,
      retry: jest.fn(),
    });

    render(<TaskTimelineWidget widget={widget} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Task timeline unavailable',
    );
    expect(
      screen.getByText('You do not have permission to view task data.'),
    ).toBeVisible();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('does not render the removed detail list or schedule forms', () => {
    const updateTask = jest.fn();
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [
        {
          id: 'task-1',
          title: 'Release planning',
          startDate: '2026-09-19',
          endDate: '2026-09-21',
          progress: 25,
          isMilestone: false,
          dependencies: [],
          conflict: false,
        },
      ],
      hasConfigurationGap: false,
      canEditDates: true,
      canEditProgress: true,
      updateTask,
      retry: jest.fn(),
    });

    render(<TaskTimelineWidget widget={widget} />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resize task start date' })).toBeVisible();
  });

  it('renders a calendar grid across inclusive date boundaries', () => {
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [
        {
          id: 'task-1',
          title: 'First task',
          startDate: '2026-09-19T00:00:00.000Z',
          endDate: '2026-09-20T00:00:00.000Z',
          progress: 25,
          isMilestone: false,
          dependencies: [],
          conflict: false,
        },
        {
          id: 'task-2',
          title: 'Second task',
          startDate: '2026-09-21',
          endDate: '2026-09-21',
          progress: 100,
          isMilestone: false,
          dependencies: [],
          conflict: false,
        },
      ],
      hasConfigurationGap: false,
      retry: jest.fn(),
    });

    render(<TaskTimelineWidget widget={widget} />);

    expect(
      screen.getByRole('grid', { name: 'Task timeline calendar' }),
    ).toBeVisible();
    const calendarViewport = screen.getByTestId(
      'task-timeline-calendar-viewport',
    );
    expect(calendarViewport).toHaveAttribute(
      'data-scrollable',
      'horizontal vertical',
    );
    expect(
      screen.getByRole('grid', { name: 'Task timeline calendar' }),
    ).toHaveAttribute('data-date-column-width', '7rem');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(13);
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      '09-19',
      '09-20',
      '09-21',
      '09-22',
      '09-23',
      '09-24',
      '09-25',
      '09-26',
      '09-27',
      '09-28',
      '09-29',
      '09-30',
      '10-01',
    ]);
    expect(screen.getByTestId('timeline-task-chip-task-1')).toHaveStyle(
      'grid-column: 1 / span 2',
    );
    expect(screen.getByTestId('timeline-task-chip-task-2')).toHaveStyle(
      'grid-column: 3 / span 1',
    );
    expect(screen.getAllByRole('button', { name: 'First task' })).toHaveLength(2);
    expect(calendarViewport).not.toHaveTextContent('.000Z');
  });

  it('renders a clear fallback for tasks with missing dates', () => {
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [
        {
          id: 'task-1',
          title: 'Unscheduled task',
          startDate: null,
          endDate: null,
          progress: null,
          isMilestone: false,
          dependencies: [],
          conflict: false,
        },
      ],
      hasConfigurationGap: true,
      retry: jest.fn(),
    });

    render(<TaskTimelineWidget widget={widget} />);

    expect(screen.getByText('No dated tasks to display')).toBeVisible();
    expect(screen.queryByText('Timeline position unavailable without both dates')).not.toBeInTheDocument();
    expect(screen.queryByText('Start date unavailable')).not.toBeInTheDocument();
    expect(screen.queryByText('End date unavailable')).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('uses the local calendar day for the first header', () => {
    expect(getActualTaskTimelineToday(new Date(2026, 8, 20, 23, 59))).toBe(
      '2026-09-20',
    );
  });

  it('keeps the minimum horizon, extends it for later tasks, hides past tasks, and clips active task bars', () => {
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [
        {
          id: 'past-task',
          title: 'Past task',
          startDate: '2026-09-01',
          endDate: '2026-09-18',
          progress: null,
          isMilestone: false,
          dependencies: [],
          conflict: false,
        },
        {
          id: 'active-task',
          title: 'Active task',
          startDate: '2026-09-01',
          endDate: '2026-09-20',
          progress: null,
          isMilestone: false,
          dependencies: [],
          conflict: false,
        },
        {
          id: 'later-task',
          title: 'Later task',
          startDate: '2026-09-25',
          endDate: '2026-10-10',
          progress: null,
          isMilestone: false,
          dependencies: [],
          conflict: false,
        },
      ],
      hasConfigurationGap: false,
      retry: jest.fn(),
    });

    render(<TaskTimelineWidget widget={widget} />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(22);
    expect(headers[0]).toHaveTextContent('09-19');
    expect(headers[headers.length - 1]).toHaveTextContent('10-10');
    expect(screen.queryByTestId('timeline-task-chip-past-task')).not.toBeInTheDocument();
    expect(screen.getByTestId('timeline-task-chip-active-task')).toHaveStyle(
      'grid-column: 1 / span 2',
    );
  });

  it('shows an empty state when every dated task has ended', () => {
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [{
        id: 'past-task',
        title: 'Past task',
        startDate: '2026-09-01',
        endDate: '2026-09-18',
        progress: null,
        isMilestone: false,
        dependencies: [],
        conflict: false,
      }],
      hasConfigurationGap: false,
      retry: jest.fn(),
    });

    render(<TaskTimelineWidget widget={widget} />);

    expect(screen.getByText('No active tasks to display')).toBeVisible();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it.each([
    ['move', '2026-09-20', '2026-09-23'],
    ['start', '2026-09-20', '2026-09-22'],
    ['end', '2026-09-19', '2026-09-23'],
  ])('updates dates when dragging the task %s', async (mode, startDate, endDate) => {
    const updateTask = jest.fn().mockResolvedValue(undefined);
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [{
        id: 'task-1',
        title: 'Draggable task',
        startDate: '2026-09-19',
        endDate: '2026-09-22',
        progress: null,
        isMilestone: false,
        dependencies: [],
        conflict: false,
      }],
      hasConfigurationGap: false,
      canEditDates: true,
      updateTask,
      retry: jest.fn(),
    });

    render(<TaskTimelineWidget widget={widget} />);
    const chip = screen.getByTestId('timeline-task-chip-task-1');
    const track = chip.parentElement!;
    Object.defineProperty(track, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 300 }),
    });
    const control =
      mode === 'move'
        ? chip
        : screen.getByRole('button', {
            name: mode === 'start' ? 'Resize task start date' : 'Resize task due date',
          });
    fireEvent.mouseDown(control, { clientX: 10 });
    fireEvent.mouseMove(window, { clientX: 35 });
    fireEvent.mouseUp(window, { clientX: 35 });

    await waitFor(() =>
      expect(updateTask).toHaveBeenCalledWith({
        taskId: 'task-1',
        startDate,
        endDate,
      }),
    );
  });

  it('renders a live move preview and updates only when released', async () => {
    const updateTask = jest.fn().mockResolvedValue(undefined);
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [{
        id: 'task-1', title: 'Preview task', startDate: '2026-09-19',
        endDate: '2026-09-22', progress: null, isMilestone: false,
        dependencies: [], conflict: false,
      }],
      hasConfigurationGap: false, canEditDates: true, updateTask, retry: jest.fn(),
    });

    render(<TaskTimelineWidget widget={widget} />);
    const chip = screen.getByTestId('timeline-task-chip-task-1');
    Object.defineProperty(chip.parentElement!, 'getBoundingClientRect', {
      configurable: true, value: () => ({ width: 300 }),
    });
    fireEvent.mouseDown(chip, { clientX: 10 });
    fireEvent.mouseMove(window, { clientX: 35 });

    expect(screen.getByText(/Preview task.*Start 09-20.*Due 09-23/)).toBeVisible();
    expect(chip).toHaveStyle('grid-column: 2 / span 4');
    expect(updateTask).not.toHaveBeenCalled();

    fireEvent.mouseUp(window, { clientX: 35 });
    await waitFor(() => expect(updateTask).toHaveBeenCalledWith({
      taskId: 'task-1', startDate: '2026-09-20', endDate: '2026-09-23',
    }));
  });

  it.each([
    ['Resize task start date', '2026-09-20', '2026-09-22'],
    ['Resize task due date', '2026-09-19', '2026-09-23'],
  ])('previews %s before release', (handleName, startDate, endDate) => {
    const updateTask = jest.fn().mockResolvedValue(undefined);
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [{
        id: 'task-1', title: 'Resize task', startDate: '2026-09-19',
        endDate: '2026-09-22', progress: null, isMilestone: false,
        dependencies: [], conflict: false,
      }],
      hasConfigurationGap: false, canEditDates: true, updateTask, retry: jest.fn(),
    });
    render(<TaskTimelineWidget widget={widget} />);
    const handle = screen.getByRole('button', { name: handleName });
    Object.defineProperty(handle.parentElement!.parentElement!, 'getBoundingClientRect', {
      configurable: true, value: () => ({ width: 300 }),
    });
    fireEvent.mouseDown(handle, { clientX: 10 });
    fireEvent.mouseMove(window, { clientX: 35 });
    expect(screen.getByText(new RegExp(`Start ${startDate.slice(5)}.*Due ${endDate.slice(5)}`))).toBeVisible();
    expect(updateTask).not.toHaveBeenCalled();
  });

  it('marks and rejects an invalid reversed preview', async () => {
    const updateTask = jest.fn().mockResolvedValue(undefined);
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [{
        id: 'task-1', title: 'Invalid preview', startDate: '2026-09-19',
        endDate: '2026-09-22', progress: null, isMilestone: false,
        dependencies: [], conflict: false,
      }],
      hasConfigurationGap: false, canEditDates: true, updateTask, retry: jest.fn(),
    });
    render(<TaskTimelineWidget widget={widget} />);
    const handle = screen.getByRole('button', { name: 'Resize task start date' });
    Object.defineProperty(handle.parentElement!.parentElement!, 'getBoundingClientRect', {
      configurable: true, value: () => ({ width: 300 }),
    });
    fireEvent.mouseDown(handle, { clientX: 10 });
    fireEvent.mouseMove(window, { clientX: 310 });
    expect(screen.getByText(/Preview \(invalid\)/)).toBeVisible();
    fireEvent.mouseUp(window, { clientX: 310 });
    expect(updateTask).not.toHaveBeenCalled();
    expect(await screen.findByText('Start date cannot be after due date.')).toBeVisible();
  });

  it('expands the preview calendar beyond the original bounds and exposes pan instructions', () => {
    const updateTask = jest.fn();
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [{
        id: 'task-1', title: 'Outside task', startDate: '2026-09-19',
        endDate: '2026-09-22', progress: null, isMilestone: false,
        dependencies: [], conflict: false,
      }],
      hasConfigurationGap: false, canEditDates: true, updateTask, retry: jest.fn(),
    });
    render(<TaskTimelineWidget widget={widget} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    const chip = screen.getByTestId('timeline-task-chip-task-1');
    Object.defineProperty(chip.parentElement!, 'getBoundingClientRect', {
      configurable: true, value: () => ({ width: 300 }),
    });
    fireEvent.mouseDown(chip, { clientX: 10 });
    fireEvent.mouseMove(window, { clientX: -65 });
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('09-19');
    expect(screen.getByText(/Scroll horizontally and vertically/)).toBeVisible();
  });

  it('does not drag when date editing is unavailable', () => {
    const updateTask = jest.fn();
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [{
        id: 'task-1',
        title: 'Read-only task',
        startDate: '2026-09-19',
        endDate: '2026-09-22',
        progress: null,
        isMilestone: false,
        dependencies: [],
        conflict: false,
      }],
      hasConfigurationGap: false,
      canEditDates: false,
      updateTask,
      retry: jest.fn(),
    });

    render(<TaskTimelineWidget widget={widget} />);
    expect(screen.queryByRole('button', { name: 'Resize task start date' })).not.toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('timeline-task-chip-task-1'), {
      clientX: 10,
    });
    fireEvent.mouseMove(window, { clientX: 85 });
    fireEvent.mouseUp(window, { clientX: 85 });
    expect(updateTask).not.toHaveBeenCalled();
  });

  it('shifts dates with UTC-safe whole-day arithmetic', () => {
    expect(shiftTaskTimelineDate('2026-03-08T23:00:00.000Z', 1)).toBe('2026-03-09');
    expect(shiftTaskTimelineDate('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('normalizes mapped date values to date-only strings', () => {
    expect(normalizeTaskTimelineDate('2026-09-23T00:00:00.000Z')).toBe(
      '2026-09-23',
    );
    expect(normalizeTaskTimelineDate('2026-09-23')).toBe('2026-09-23');
    expect(normalizeTaskTimelineDate(null)).toBeNull();
    expect(normalizeTaskTimelineDate('not-a-date')).toBeNull();
  });

  it.each([
    [false, false],
    [true, false],
    [false, true],
  ])('keeps schedule controls out of the calendar dates=%s progress=%s', (canEditDates, canEditProgress) => {
      mockedUseTaskTimelineData.mockReturnValue({
        status: 'ready',
        items: [
          {
            id: 'task-1',
            title: 'Permission task',
            startDate: '2026-09-19',
            endDate: '2026-09-21',
            progress: 25,
            isMilestone: false,
            dependencies: [],
            conflict: false,
          },
        ],
        hasConfigurationGap: false,
        canEditDates,
        canEditProgress,
        retry: jest.fn(),
      });

      render(<TaskTimelineWidget widget={widget} />);

      expect(screen.queryAllByRole('textbox')).toHaveLength(0);
      expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
      expect(screen.queryAllByDisplayValue('2026-09-19')).toHaveLength(0);
      expect(screen.queryAllByRole('button', { name: 'Save task changes' })).toHaveLength(0);
    },
  );

  it('scopes save errors to the task row that failed', async () => {
    const updateTask = jest.fn().mockRejectedValue(new Error('Task save failed'));
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [
        {
          id: 'task-1',
          title: 'First task',
          startDate: '2026-09-19',
          endDate: '2026-09-21',
          progress: 25,
          isMilestone: false,
          dependencies: [],
          conflict: false,
        },
        {
          id: 'task-2',
          title: 'Second task',
          startDate: '2026-09-19',
          endDate: '2026-09-21',
          progress: 25,
          isMilestone: false,
          dependencies: [],
          conflict: false,
        },
      ],
      hasConfigurationGap: false,
      canEditDates: true,
      updateTask,
      retry: jest.fn(),
    });

    render(<TaskTimelineWidget widget={widget} />);
    const chip = screen.getByTestId('timeline-task-chip-task-1');
    Object.defineProperty(chip.parentElement!, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 300 }),
    });
    fireEvent.mouseDown(chip, { clientX: 10 });
    fireEvent.mouseMove(window, { clientX: 85 });
    fireEvent.mouseUp(window, { clientX: 85 });

    await waitFor(() => expect(updateTask).toHaveBeenCalledTimes(1));
    expect(screen.getAllByText('Task save failed')).toHaveLength(1);
    expect(chip).toHaveAccessibleDescription('Task save failed');
  });

  it('keeps the calendar conflict visible without rescheduling', () => {
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [
        {
          id: 'task-1',
          title: 'Conflicting task',
          startDate: '2026-09-20',
          endDate: '2026-09-22',
          progress: 25,
          isMilestone: false,
          dependencies: [{
            predecessorId: 'task-0',
            successorId: 'task-1',
            type: 'FINISH_TO_START',
            conflict: true,
          }],
          conflict: true,
        },
      ],
      hasConfigurationGap: false,
      retry: jest.fn(),
    });

    render(<TaskTimelineWidget widget={widget} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Dependency conflict; dates were not rescheduled.',
    );
  });

  it('opens the task record side panel from chip and label keyboard activation', () => {
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [{
        id: 'task-1',
        title: 'Keyboard task',
        startDate: '2026-09-19',
        endDate: '2026-09-19',
        progress: 0,
        isMilestone: false,
        dependencies: [],
        conflict: false,
      }],
      hasConfigurationGap: false,
      retry: jest.fn(),
    });

    render(<TaskTimelineWidget widget={widget} />);

    const chip = screen.getByTestId('timeline-task-chip-task-1');
    fireEvent.click(chip);
    fireEvent.keyDown(screen.getAllByRole('button', { name: 'Keyboard task' })[0], {
      key: 'Enter',
    });
    expect(openRecordInSidePanel).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('uses the configured bar color and falls back safely when it is invalid', () => {
    mockedUseTaskTimelineData.mockReturnValue({
      status: 'ready',
      items: [{
        id: 'task-1', title: 'Colored task', startDate: '2026-09-19',
        endDate: '2026-09-19', progress: 0, isMilestone: false,
        dependencies: [], conflict: false,
      }],
      hasConfigurationGap: false,
      retry: jest.fn(),
    });

    const configuredWidget = {
      ...widget,
      configuration: {
        __typename: 'TaskTimelineConfiguration',
        configurationType: 'TASK_TIMELINE',
        barColor: '#123456',
      },
    } as PageLayoutWidget;
    const { rerender } = render(
      <TaskTimelineWidget widget={configuredWidget} />,
    );

    expect(screen.getByTestId('timeline-task-chip-task-1')).toHaveStyle(
      '--task-timeline-bar-color: #123456',
    );

    rerender(
      <TaskTimelineWidget
        widget={{
          ...configuredWidget,
          configuration: {
            ...configuredWidget.configuration,
            barColor: 'not-a-color',
          },
        } as PageLayoutWidget}
      />,
    );

    expect(screen.getByTestId('timeline-task-chip-task-1')).toHaveStyle(
      '--task-timeline-bar-color: #3b82f6',
    );
  });

  it('keeps missing dates unpositionable in the calendar utility', () => {
    expect(getTaskTimelineCalendarDates('2026-09-19', null)).toEqual([]);
  });

  it('resolves configured field IDs and falls back for missing mappings', () => {
    const fields = [
      { id: 'default-title-id', name: 'title' },
      { id: 'title-id', name: 'customTitle' },
      { id: 'start-id', name: 'customStart' },
      { id: 'due-id', name: 'customDue' },
      { id: 'default-status-id', name: 'status' },
      { id: 'status-id', name: 'customStatus' },
    ];

    expect(
      resolveTaskTimelineFieldNames({
        fields,
        fieldMapping: {
          titleFieldMetadataId: 'title-id',
          startDateFieldMetadataId: 'start-id',
          dueDateFieldMetadataId: 'due-id',
          progressFieldMetadataId: null,
          statusFieldMetadataId: 'status-id',
        },
      }),
    ).toMatchObject({
      title: 'customTitle',
      startDate: 'customStart',
      endDate: 'customDue',
      progress: undefined,
        status: 'customStatus',
      });

    expect(
      resolveTaskTimelineFieldNames({
        fields,
        fieldMapping: {
          titleFieldMetadataId: null,
          statusFieldMetadataId: 'stale-status-id',
        },
      }),
    ).toMatchObject({
      title: 'title',
      status: 'status',
    });
  });
});
