import { render, screen } from '@testing-library/react';
import { useContext } from 'react';
import { TimelineViewWidget } from '@/page-layout/widgets/view/components/TimelineViewWidget';
import { useTimelineData } from '@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { type View } from '@/views/types/View';
import { ViewFilterOperand } from 'twenty-shared/types';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock(
  '@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData',
  () => ({
    useTimelineData: jest.fn(() => ({
      status: 'empty',
      items: [],
      hasConfigurationGap: false,
      retry: jest.fn(),
    })),
  }),
);
jest.mock(
  '@/object-record/record-index/components/TimelineViewSettings',
  () => ({
    TimelineViewSettings: () => {
      throw new Error('Widget must not mount native settings');
    },
  }),
);
jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => {
    throw new Error('Widget must not require native index context');
  },
}));
jest.mock(
  '@/page-layout/widgets/task-timeline/components/TaskTimelineWidget',
  () => ({
    TaskTimeline: ({ instanceId }: { instanceId: string }) => {
      const context = useContext(ContextStoreComponentInstanceContext);
      const view = useContext(ViewComponentInstanceContext);
      const filters = useContext(RecordFiltersComponentInstanceContext);
      return (
        <div data-testid={instanceId}>
          {JSON.stringify([context, view, filters])}
        </div>
      );
    },
  }),
);
const task = getMockObjectMetadataItemOrThrow('task');
const title = task.fields.find((field) => field.name === 'title')!;
const view = {
  id: 'planning',
  objectMetadataId: task.id,
  viewFields: [],
  viewFilterGroups: [],
  viewSorts: [],
  viewFilters: [
    {
      id: 'f',
      fieldMetadataId: title.id,
      operand: ViewFilterOperand.CONTAINS,
      value: 'saved',
    },
  ],
  anyFieldFilterValue: 'needle',
} as unknown as View;

it('uses the common strict loader only after initialization, with unique contexts and selected-view refresh', () => {
  const wrapper = getJestMetadataAndApolloMocksWrapper({});
  const widgets = (saved: View) => (
    <RecordGroupContext.Provider value={{ recordGroupId: 'inherited' }}>
      <TimelineViewWidget view={saved} objectMetadataItem={task} widgetId="a" />
      <TimelineViewWidget view={view} objectMetadataItem={task} widgetId="b" />
    </RecordGroupContext.Provider>
  );
  const { rerender } = render(widgets(view), { wrapper });
  for (const id of ['a', 'b']) {
    const scope = `view-timeline-widget-${id}`;
    expect(screen.getByTestId(scope)).toHaveTextContent(
      JSON.stringify([
        { instanceId: scope },
        { instanceId: scope },
        { instanceId: scope },
      ]),
    );
  }
  const calls = jest.mocked(useTimelineData).mock.calls;
  expect(calls.length).toBeGreaterThan(0);
  for (const [options] of calls) {
    expect(options.requireConfiguredDates).toBe(true);
    expect(options.query?.filter).toHaveProperty('and');
    expect(JSON.stringify(options.query?.filter)).toContain('%saved%');
    expect(JSON.stringify(options.query?.filter)).toContain('%needle%');
    expect(options.query).not.toHaveProperty('limit');
  }
  jest.mocked(useTimelineData).mockClear();
  rerender(
    widgets({ ...view, id: 'new-view', anyFieldFilterValue: 'replacement' }),
  );
  expect(
    jest
      .mocked(useTimelineData)
      .mock.calls.some(([options]) =>
        JSON.stringify(options.query?.filter).includes('%replacement%'),
      ),
  ).toBe(true);
  expect(
    jest
      .mocked(useTimelineData)
      .mock.calls.every(([options]) =>
        JSON.stringify(options.query?.filter).includes('%saved%'),
      ),
  ).toBe(true);
});
