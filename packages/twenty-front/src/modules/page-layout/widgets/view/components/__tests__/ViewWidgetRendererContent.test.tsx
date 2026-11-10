import { render, screen } from '@testing-library/react';
import { ViewWidgetRendererContent } from '@/page-layout/widgets/view/components/ViewWidgetRendererContent';
import { ViewType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const task = getMockObjectMetadataItemOrThrow('task');
let mockView: unknown;
const mockTimeline = jest.fn();
const mockProvider = jest.fn();
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({
    useAtomFamilySelectorValue: (selector: unknown, key: any) =>
      key?.viewId === 'saved'
        ? mockView
        : jest
            .requireActual(
              '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
            )
            .useAtomFamilySelectorValue(selector, key),
  }),
);
jest.mock('@/page-layout/widgets/view/components/TimelineViewWidget', () => ({
  TimelineViewWidget: (props: unknown) => {
    mockTimeline(props);
    return <div>Timeline</div>;
  },
}));
jest.mock(
  '@/object-record/record-table-widget/components/RecordTableWidgetProvider',
  () => ({
    RecordTableWidgetProvider: ({ children, ...props }: any) => {
      mockProvider(props);
      return children;
    },
  }),
);
jest.mock(
  '@/object-record/record-board/components/RecordBoardContainer',
  () => ({
    RecordBoardContainer: (props: any) => (
      <div data-testid="board">{JSON.stringify(props)}</div>
    ),
  }),
);
beforeEach(() => {
  jest.clearAllMocks();
  mockView = {
    id: 'saved',
    type: ViewType.TIMELINE,
    isActive: true,
    objectMetadataId: task.id,
  };
});
const mount = (objectMetadataId = task.id) =>
  render(
    <ViewWidgetRendererContent
      objectMetadataId={objectMetadataId}
      viewId="saved"
      widgetId="widget-a"
    />,
    {
      wrapper: getJestMetadataAndApolloMocksWrapper({
        objectMetadataItems: [
          task,
          getMockObjectMetadataItemOrThrow('company'),
        ],
      }),
    },
  );
it('dispatches the saved Timeline without a table provider', () => {
  mount();
  expect(screen.getByText('Timeline')).toBeInTheDocument();
  expect(mockTimeline).toHaveBeenCalledWith(
    expect.objectContaining({
      view: mockView,
      widgetId: 'widget-a',
      objectMetadataItem: expect.objectContaining({ id: task.id }),
    }),
  );
  expect(mockProvider).not.toHaveBeenCalled();
});
it.each([
  undefined,
  { type: ViewType.TABLE, isActive: true, objectMetadataId: task.id },
  { type: ViewType.TIMELINE, isActive: false, objectMetadataId: task.id },
  { type: ViewType.TIMELINE, isActive: true, objectMetadataId: 'other' },
])('does not mount a data child for invalid views: %j', (view) => {
  mockView = view;
  mount();
  expect(screen.getByRole('status')).toHaveTextContent(
    'This view is unavailable.',
  );
  expect(mockTimeline).not.toHaveBeenCalled();
  expect(mockProvider).not.toHaveBeenCalled();
});
it('tolerates an unavailable object without mounting a data child', () => {
  mount('missing');
  expect(screen.getByRole('status')).toHaveTextContent(
    'This view is unavailable.',
  );
  expect(mockTimeline).not.toHaveBeenCalled();
  expect(mockProvider).not.toHaveBeenCalled();
});
it('preserves the Kanban provider and board IDs', () => {
  mockView = {
    id: 'saved',
    type: ViewType.KANBAN,
    isActive: true,
    objectMetadataId: task.id,
  };
  mount();
  expect(mockProvider).toHaveBeenCalledWith({
    objectNameSingular: 'task',
    viewId: 'saved',
    widgetId: 'widget-a',
    viewType: ViewType.KANBAN,
  });
  expect(screen.getByTestId('board')).toHaveTextContent('tasks-saved');
  expect(mockTimeline).not.toHaveBeenCalled();
});
