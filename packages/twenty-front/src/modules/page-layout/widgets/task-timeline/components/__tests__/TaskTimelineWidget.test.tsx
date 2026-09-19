import { fireEvent, render, screen } from '@testing-library/react';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { TaskTimelineWidget } from '@/page-layout/widgets/task-timeline/components/TaskTimelineWidget';
import { useTaskTimelineData } from '@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData';

jest.mock('@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData');

const mockedUseTaskTimelineData = jest.mocked(useTaskTimelineData);
const widget = { id: 'timeline-widget' } as PageLayoutWidget;

describe('TaskTimelineWidget', () => {
  beforeEach(() => {
    mockedUseTaskTimelineData.mockReset();
  });

  it('renders focusable text rows at a narrow viewport', () => {
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
    expect(
      screen.getByRole('list', { name: 'Task timeline items' }),
    ).toBeVisible();
    expect(
      screen.getByRole('listitem', { name: 'Release planning' }),
    ).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('Milestone')).toBeVisible();
    expect(screen.getByText('End date unavailable')).toBeVisible();
    expect(screen.getByText('Progress unavailable')).toBeVisible();
    expect(screen.getByText('Finish-to-start dependency (1)')).toBeVisible();
    expect(
      screen.getByText('Dependency conflict; dates were not rescheduled.'),
    ).toHaveAttribute('role', 'alert');
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
});
