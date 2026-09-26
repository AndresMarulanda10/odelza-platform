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
  '@/page-layout/widgets/personal-finance/components/PersonalFinanceWidget',
  () => ({
    PersonalFinanceWidget: ({ widget }: { widget: PageLayoutWidget }) => (
      <div data-testid="personal-finance-renderer">{widget.id}</div>
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

describe('WidgetContentRenderer', () => {
  it.each([
    [WidgetType.TASK_TIMELINE, 'task-timeline-renderer'],
    [WidgetType.PERSONAL_FINANCE, 'personal-finance-renderer'],
  ])('dispatches %s to its native renderer', (type, testId) => {
    render(<WidgetContentRenderer widget={widget(type)} />);

    expect(screen.getByTestId(testId)).toHaveTextContent(`${type}-widget`);
  });
});
