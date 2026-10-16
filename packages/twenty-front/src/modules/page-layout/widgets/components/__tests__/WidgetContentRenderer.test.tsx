import { render, screen } from '@testing-library/react';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { WidgetType } from '~/generated-metadata/graphql';

jest.mock(
  '@/page-layout/widgets/task-timeline/components/TaskTimelineWidget',
  () => ({
    TaskTimelineWidget: ({ widget }: { widget: PageLayoutWidget }) => (
      <div data-testid="task-timeline-renderer">{widget.id}</div>
    ),
  }),
);
jest.mock(
  '@/page-layout/widgets/email-thread/components/EmailThreadWidget',
  () => ({
    EmailThreadWidget: () => null,
  }),
);
jest.mock('@/page-layout/widgets/field/components/FieldWidget', () => ({
  FieldWidget: () => null,
}));
jest.mock(
  '@/page-layout/widgets/record-table/components/RecordTableWidgetRenderer',
  () => ({
    RecordTableWidgetRenderer: () => null,
  }),
);

const widget = (type: WidgetType): PageLayoutWidget =>
  ({ id: `${type}-widget`, type }) as PageLayoutWidget;

jest.mock('@/page-layout/widgets/view/components/ViewWidgetRenderer', () => ({
  ViewWidgetRenderer: () => <div data-testid="view-renderer" />,
}));

describe('WidgetContentRenderer', () => {
  it('preserves the separate main View renderer', () => {
    render(<WidgetContentRenderer widget={widget(WidgetType.VIEW)} />);
    expect(screen.getByTestId('view-renderer')).toBeInTheDocument();
  });
  it.each([[WidgetType.TASK_TIMELINE, 'task-timeline-renderer']])(
    'dispatches %s to its native renderer',
    (type, testId) => {
      render(<WidgetContentRenderer widget={widget(type)} />);

      expect(screen.getByTestId(testId)).toHaveTextContent(`${type}-widget`);
    },
  );
  it('keeps a saved finance widget readable as a retired placeholder', () => {
    render(
      <WidgetContentRenderer widget={widget(WidgetType.PERSONAL_FINANCE)} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'This widget is no longer available. Remove it from the dashboard.',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/finance data/i)).not.toBeInTheDocument();
  });
});
