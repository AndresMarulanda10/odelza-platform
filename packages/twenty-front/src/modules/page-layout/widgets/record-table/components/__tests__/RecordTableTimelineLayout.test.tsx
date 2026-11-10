import { render, screen } from '@testing-library/react';
import { ODELZA_THEME_LIGHT } from 'twenty-ui/theme';
import { RecordTableWidgetRenderer } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRenderer';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

const mockTimeline = jest.fn();
const mockPrivateView = {
  id: 'private-view',
  objectMetadataId: 'companies',
  timelineConfiguration: { barColor: ODELZA_THEME_LIGHT.color.blue },
};
jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: () => ({
    objectMetadataItem: { id: 'companies', nameSingular: 'company' },
  }),
}));
jest.mock(
  '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore',
  () => ({
    usePageLayoutIdFromContextStore: () => ({ pageLayoutId: 'layout' }),
  }),
);
jest.mock(
  '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay',
  () => ({
    useRecordTableWidgetViewForDisplay: () => ({ view: mockPrivateView }),
  }),
);
jest.mock(
  '@/page-layout/widgets/record-table/components/RecordTableWidgetViewDraftInitEffect',
  () => ({ RecordTableWidgetViewDraftInitEffect: () => null }),
);
jest.mock(
  '@/object-record/record-table-widget/components/RecordTableWidgetProvider',
  () => ({
    RecordTableWidgetProvider: ({
      children,
    }: {
      children: React.ReactNode;
    }) => <div data-testid="table-provider">{children}</div>,
  }),
);
jest.mock(
  '@/object-record/record-table-widget/components/RecordTableWidget',
  () => ({ RecordTableWidget: () => <div>Existing table</div> }),
);
jest.mock(
  '@/page-layout/widgets/record-table/components/OverdueAttentionWidget',
  () => ({ OverdueAttentionWidget: () => <div>Existing overdue</div> }),
);
jest.mock('@/page-layout/widgets/view/components/TimelineViewWidget', () => ({
  TimelineViewWidget: (props: unknown) => {
    mockTimeline(props);
    return <div>Shared timeline</div>;
  },
}));

it('switches the actual View Table→Timeline→Table without changing its identity, source, private view or limit', () => {
  const widget = (presentationMode: string) =>
    ({
      id: 'widget',
      objectMetadataId: 'companies',
      configuration: {
        configurationType: 'RECORD_TABLE',
        viewId: 'private-view',
        recordLimit: 5,
        presentationMode,
      },
    }) as PageLayoutWidget;
  const { rerender } = render(
    <RecordTableWidgetRenderer widget={widget('TABLE')} />,
  );
  expect(screen.getByText('Existing table')).toBeInTheDocument();
  rerender(<RecordTableWidgetRenderer widget={widget('TIMELINE')} />);
  expect(screen.getByText('Shared timeline')).toBeInTheDocument();
  expect(screen.queryByTestId('table-provider')).not.toBeInTheDocument();
  expect(mockTimeline).toHaveBeenLastCalledWith(
    expect.objectContaining({
      widgetId: 'widget',
      view: mockPrivateView,
      objectMetadataItem: expect.objectContaining({ id: 'companies' }),
      recordLimit: 5,
    }),
  );
  rerender(<RecordTableWidgetRenderer widget={widget('TABLE')} />);
  expect(screen.getByText('Existing table')).toBeInTheDocument();
  expect(screen.getByTestId('table-provider')).toBeInTheDocument();
  rerender(<RecordTableWidgetRenderer widget={widget('OVERDUE_ATTENTION')} />);
  expect(screen.getByText('Existing overdue')).toBeInTheDocument();
});
