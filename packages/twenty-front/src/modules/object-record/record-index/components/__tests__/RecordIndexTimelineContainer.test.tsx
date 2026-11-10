import { act, fireEvent, render, screen } from '@testing-library/react';
import { ODELZA_THEME_LIGHT } from 'twenty-ui/theme';
import { TimelineView } from '@/object-record/record-index/components/RecordIndexTimelineContainer';
import { useTimelineData } from '@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData';
import { TaskTimeline } from '@/page-layout/widgets/task-timeline/components/TaskTimelineWidget';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordIndexContainer } from '@/object-record/record-index/components/RecordIndexContainer';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useHasCurrentViewNonReadableFields } from '@/object-record/record-index/hooks/useHasCurrentViewNonReadableFields';

jest.mock(
  '@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData',
  () => ({ useTimelineData: jest.fn() }),
);
jest.mock(
  '@/page-layout/widgets/task-timeline/components/TaskTimelineWidget',
  () => ({ TaskTimeline: jest.fn(() => <div>Shared timeline</div>) }),
);
jest.mock(
  '@/object-record/record-index/components/TimelineViewSettings',
  () => ({ TimelineViewSettings: () => null }),
);
jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: jest.fn(() => {
    throw new Error('Common renderer must not require native context');
  }),
}));
jest.mock('@/views/hooks/useGetCurrentViewOnly', () => ({
  useGetCurrentViewOnly: () => ({ currentView: view }),
}));
jest.mock(
  '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams',
  () => ({ useFindManyTimelineViewParams: jest.fn() }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => 'TIMELINE',
}));
jest.mock(
  '@/object-record/record-index/hooks/useHasCurrentViewNonReadableFields',
  () => ({
    useHasCurrentViewNonReadableFields: jest.fn(() => ({
      hasCurrentViewNonReadableFields: false,
    })),
  }),
);
jest.mock(
  '@/object-record/record-index/components/RecordIndexFiltersToContextStoreEffect',
  () => ({ RecordIndexFiltersToContextStoreEffect: () => null }),
);
jest.mock(
  '@/object-record/record-index/components/RecordIndexEmptyStateNotShared',
  () => ({ RecordIndexEmptyStateNotShared: () => <div>Not shared</div> }),
);
jest.mock(
  '@/object-record/record-index/components/RecordIndexTableContainer',
  () => ({ RecordIndexTableContainer: () => null }),
);
jest.mock(
  '@/object-record/record-index/components/RecordIndexCalendarContainer',
  () => ({ RecordIndexCalendarContainer: () => null }),
);
jest.mock(
  '@/object-record/record-index/components/RecordIndexCatalogContainer',
  () => ({ RecordIndexCatalogContainer: () => null }),
);
jest.mock(
  '@/object-record/record-board/components/RecordBoardContainer',
  () => ({ RecordBoardContainer: () => null }),
);

const source = {
  id: 'tasks',
  fields: [
    { id: 'start-local', universalIdentifier: 'start-universal' },
    { id: 'end-local', universalIdentifier: 'end-universal' },
  ],
} as EnrichedObjectMetadataItem;
const view = {
  id: 'saved',
  objectMetadataId: 'tasks',
  timelineConfiguration: {
    startDateFieldMetadataUniversalIdentifier: 'start-universal',
    endDateFieldMetadataUniversalIdentifier: 'end-universal',
    barColor: ODELZA_THEME_LIGHT.color.blue,
  },
};
const query = {
  filter: { title: { ilike: '%needle%' } },
  orderBy: [{ title: 'AscNullsFirst' as const }],
};
const loadMore = jest.fn();
it('caps widget records at the total limit without offering pagination beyond that limit', () => {
  const items = ['one', 'two'].map((id) => ({
    id,
    title: id,
    startDate: '2026-11-05',
    endDate: '2026-11-06',
    progress: null,
    dependencies: [],
    isMilestone: false,
    conflict: false,
  }));
  jest.mocked(useTimelineData).mockReturnValue({
    status: 'ready',
    items,
    hasConfigurationGap: false,
    retry: jest.fn(),
    hasNextPage: true,
    loadMore,
  });
  render(
    <TimelineView
      view={view}
      objectMetadataItem={source}
      instanceId="limited-widget"
      query={{ ...query, limit: 1 }}
      recordLimit={1}
    />,
  );
  expect(jest.mocked(TaskTimeline).mock.calls.at(-1)![0].data.items).toEqual([
    items[0],
  ]);
  expect(
    screen.queryByRole('button', { name: 'Load more' }),
  ).not.toBeInTheDocument();
});
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useTimelineData).mockReturnValue({
    status: 'ready',
    items: [],
    hasConfigurationGap: false,
    retry: jest.fn(),
    hasNextPage: true,
    loadMore,
  });
  loadMore.mockResolvedValue(undefined);
});

it('loads once with saved mapping, scoped query and strict dates without native context', () => {
  render(
    <TimelineView
      view={view}
      objectMetadataItem={source}
      instanceId="embedded-a"
      query={query}
    />,
  );
  expect(useTimelineData).toHaveBeenCalledTimes(1);
  expect(useTimelineData).toHaveBeenCalledWith({
    sourceObjectMetadataId: 'tasks',
    fieldMapping: {
      startDateFieldMetadataId: 'start-local',
      dueDateFieldMetadataId: 'end-local',
    },
    query,
    requireConfiguredDates: true,
  });
  expect(jest.mocked(TaskTimeline).mock.calls[0][0]).toMatchObject({
    instanceId: 'embedded-a',
    barColor: ODELZA_THEME_LIGHT.color.blue,
    configurationScope: 'view',
  });
});

it('does not infer dates from missing configuration and shows a view-specific prompt', () => {
  jest.mocked(useTimelineData).mockReturnValue({
    status: 'partial',
    items: [],
    hasConfigurationGap: true,
    retry: jest.fn(),
  });
  render(
    <TimelineView
      view={{ ...view, timelineConfiguration: null }}
      objectMetadataItem={source}
      instanceId="native"
      query={query}
      settings={<div>Native settings</div>}
    />,
  );
  expect(useTimelineData).toHaveBeenCalledWith(
    expect.objectContaining({
      fieldMapping: {
        startDateFieldMetadataId: null,
        dueDateFieldMetadataId: null,
      },
      requireConfiguredDates: true,
    }),
  );
  expect(
    screen.getByText(
      'Configure readable start and end date fields in this view’s settings.',
    ),
  ).toBeInTheDocument();
  expect(screen.getByText('Native settings')).toBeInTheDocument();
});

it('exposes pagination failures and allows retry without hiding loaded records', async () => {
  loadMore.mockRejectedValueOnce(new Error('Next page unavailable'));
  render(
    <TimelineView
      view={view}
      objectMetadataItem={source}
      instanceId="native"
      query={query}
    />,
  );
  await act(async () =>
    fireEvent.click(screen.getByRole('button', { name: /Load more/ })),
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Next page unavailable');
  expect(screen.getByText('Shared timeline')).toBeInTheDocument();
  await act(async () =>
    fireEvent.click(screen.getByRole('button', { name: /Load more/ })),
  );
  expect(loadMore).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('shows loading feedback and prevents duplicate pagination while a page is pending', async () => {
  let finish!: () => void;
  loadMore.mockReturnValue(
    new Promise<void>((resolve) => {
      finish = resolve;
    }),
  );
  render(
    <TimelineView
      view={view}
      objectMetadataItem={source}
      instanceId="native"
      query={query}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /Load more/ }));
  expect(screen.getByRole('button', { name: /Loading/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /Loading/ }));
  expect(loadMore).toHaveBeenCalledTimes(1);
  await act(async () => finish());
  expect(screen.getByRole('button', { name: /Load more/ })).toBeEnabled();
});

it('dispatches the native Timeline branch while retaining the non-readable-fields guard', () => {
  jest.mocked(useRecordIndexContextOrThrow).mockReturnValue({
    recordIndexId: 'native',
    objectMetadataItem: source,
    objectNameSingular: 'task',
  } as ReturnType<typeof useRecordIndexContextOrThrow>);
  const { rerender } = render(<RecordIndexContainer />);
  expect(screen.getByText('Shared timeline')).toBeInTheDocument();
  jest.mocked(useTimelineData).mockClear();
  jest.mocked(useHasCurrentViewNonReadableFields).mockReturnValue({
    hasCurrentViewNonReadableFields: true,
    nonReadableViewFieldInfo: {},
  } as ReturnType<typeof useHasCurrentViewNonReadableFields>);
  rerender(<RecordIndexContainer />);
  expect(screen.getByText('Not shared')).toBeInTheDocument();
  expect(screen.queryByText('Shared timeline')).not.toBeInTheDocument();
  expect(useTimelineData).not.toHaveBeenCalled();
});
