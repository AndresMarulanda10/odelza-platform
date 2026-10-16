import { act, fireEvent, render, screen } from '@testing-library/react';
import { OverdueAttentionList } from '@/page-layout/widgets/record-table/components/OverdueAttentionList';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

const mockOpen = jest.fn();
const mockMore = jest.fn();
const mockRetry = jest.fn();
let mockData = {
  identity: 'native-filtered-view',
  records: [] as ObjectRecord[],
  totalCount: 0 as number | null,
  loading: false,
  error: false,
  hasNextPage: false,
  loadMore: mockMore,
  retry: mockRetry,
};
jest.mock(
  '@/page-layout/widgets/record-table/hooks/useOverdueAttentionRecords',
  () => ({ useOverdueAttentionRecords: () => mockData }),
);
jest.mock(
  '@/page-layout/widgets/record-table/hooks/useOpenOverdueRecordInSidePanel',
  () => ({
    useOpenOverdueRecordInSidePanel: () => ({
      openOverdueRecordInSidePanel: mockOpen,
    }),
  }),
);
jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: () => ({ userTimezone: 'UTC' }),
}));
jest.mock('@/ui/field/display/components/DateTimeDisplay', () => ({
  DateTimeDisplay: ({ value }: { value: string }) => <time>{value}</time>,
}));
jest.mock('@/object-record/components/RecordChip', () => ({
  RecordChip: ({ record }: { record: ObjectRecord }) => (
    <span>{record.name as string}</span>
  ),
}));

describe('attention list interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockData = {
      ...mockData,
      identity: 'native-filtered-view',
      records: [],
      totalCount: 0,
      loading: false,
      error: false,
      hasNextPage: false,
    };
  });
  const populate = () => {
    mockData = {
      ...mockData,
      totalCount: 1800,
      hasNextPage: true,
      records: Array.from({ length: 7 }, (_, index) => ({
        __typename: 'Task',
        id: `${index}`,
        title: `Task ${index}`,
        dueAt: '2020-01-01T00:00:00Z',
        assignee:
          index === 0 ? { id: 'assignee', name: 'Native identifier' } : null,
      })),
    };
  };
  it('shows actual total, first five, bounded same-widget expansion and collapse without configuration writes', () => {
    populate();
    render(<OverdueAttentionList assigneeObjectName="workspaceMember" />);
    expect(screen.getByText('1800 overdue tasks')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Task 5' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Native identifier')).toBeInTheDocument();
    expect(screen.getAllByText('Unassigned')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: 'View all' }));
    expect(mockMore).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Task 6' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(mockMore).toHaveBeenCalledTimes(2);
    expect(mockOpen).not.toHaveBeenCalled();
    const list = screen.getByRole('list', { name: 'Overdue tasks' });
    list.scrollTop = 100;
    fireEvent.click(screen.getByRole('button', { name: 'Show less' }));
    expect(list.scrollTop).toBe(0);
    expect(
      screen.queryByRole('button', { name: 'Task 5' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Task 0' }));
    expect(mockOpen).toHaveBeenCalledWith({ recordId: '0' });
    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(screen.getAllByLabelText(/days overdue/)).toHaveLength(5);
  });
  it('has one empty native full-row button and no nested interactive descendants, and stops dashboard pointer activation', () => {
    populate();
    const dashboardPointer = jest.fn();
    const dashboardClick = jest.fn();
    render(
      <div onPointerDown={dashboardPointer} onClick={dashboardClick}>
        <OverdueAttentionList assigneeObjectName="workspaceMember" />
      </div>,
    );
    const button = screen.getByRole('button', { name: 'Task 0' });
    const row = button.closest('li')!;
    expect(row.querySelectorAll('button')).toHaveLength(1);
    expect(
      row.querySelectorAll('a, input, select, [role="button"]'),
    ).toHaveLength(0);
    expect(button.childElementCount).toBe(0);
    expect(button).toHaveAttribute('type', 'button');
    fireEvent.pointerDown(button);
    fireEvent.click(button);
    expect(dashboardPointer).not.toHaveBeenCalled();
    expect(dashboardClick).not.toHaveBeenCalled();
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });
  it('resets expansion when the authoritative query identity changes', () => {
    populate();
    const { rerender } = render(<OverdueAttentionList />);
    fireEvent.click(screen.getByRole('button', { name: 'View all' }));
    mockData = { ...mockData, identity: 'other-filter' };
    rerender(<OverdueAttentionList />);
    expect(
      screen.queryByRole('button', { name: 'Task 6' }),
    ).not.toBeInTheDocument();
  });
  it.each(['loading', 'error', 'empty'] as const)(
    'distinguishes %s from positive empty',
    (state) => {
      mockData = {
        ...mockData,
        loading: state === 'loading',
        error: state === 'error',
        totalCount: state === 'empty' ? 0 : null,
      };
      render(<OverdueAttentionList />);
      if (state === 'empty')
        expect(screen.getByText('No overdue tasks')).toBeInTheDocument();
      else
        expect(screen.queryByText('No overdue tasks')).not.toBeInTheDocument();
      if (state === 'error') {
        expect(screen.getByRole('alert')).toHaveTextContent('Unable to load');
        fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
        expect(mockRetry).toHaveBeenCalled();
      }
    },
  );
  it('does not expose an assignee when target identifiers are denied', () => {
    populate();
    render(<OverdueAttentionList />);
    expect(screen.queryByText('Native identifier')).not.toBeInTheDocument();
    expect(screen.getAllByText('Assignee unavailable')).toHaveLength(5);
  });
  it('retains valid rows and count on pagination error and retries that cursor, not the initial page', async () => {
    populate();
    mockData = { ...mockData, error: true };
    render(<OverdueAttentionList />);
    expect(screen.getByRole('button', { name: 'Task 0' })).toBeInTheDocument();
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Retry' })),
    );
    expect(mockMore).toHaveBeenCalled();
    expect(mockRetry).not.toHaveBeenCalled();
  });
});
