import { fireEvent, render, screen } from '@testing-library/react';
import { type ComponentProps } from 'react';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetCardShell } from '@/page-layout/widgets/components/WidgetCardShell';
import { IconClock, type IconComponent } from 'twenty-ui/icon';
import {
  WidgetType,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

let mockHeaderIcon: IconComponent | undefined;
jest.mock(
  '@/page-layout/widgets/widget-card/components/WidgetCardHeader',
  () => ({
    WidgetCardHeader: ({
      Icon,
      onRemove,
    }: {
      Icon?: IconComponent;
      onRemove: () => void;
    }) => {
      mockHeaderIcon = Icon;
      return <button onClick={onRemove}>Remove widget</button>;
    },
  }),
);
jest.mock('@/page-layout/widgets/widget-card/components/WidgetCard', () => ({
  WidgetCard: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),
}));
jest.mock(
  '@/page-layout/widgets/widget-card/components/WidgetCardContent',
  () => ({
    WidgetCardContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  }),
);
jest.mock('@/page-layout/widgets/components/WidgetContentRenderer', () => ({
  WidgetContentRenderer: () => (
    <p role="status">
      This widget is no longer available. Remove it from the dashboard.
    </p>
  ),
}));

const props = (
  type: WidgetType,
  mode?: string,
): ComponentProps<typeof WidgetCardShell> => ({
  widget: {
    id: 'saved',
    type,
    title: 'Saved widget',
    configuration: {
      configurationType: WidgetConfigurationType.RECORD_TABLE,
      presentationMode: mode,
    },
  } as PageLayoutWidget,
  variant: 'dashboard',
  isEditable: true,
  isEditing: false,
  isDragging: false,
  isResizing: false,
  isLastWidget: false,
  showHeader: true,
  hasAccess: true,
  restriction: { type: null },
  actions: [],
  isInVerticalListTab: false,
  isMobile: false,
  isReorderEnabled: true,
  isDeletingWidgetEnabled: true,
  onRemove: jest.fn(),
});

describe('widget shell icon and retained removal boundary', () => {
  it.each([undefined, 'TABLE', 'OVERDUE_ATTENTION'])(
    'adds a header clock only for overdue mode %s',
    (mode) => {
      render(<WidgetCardShell {...props(WidgetType.RECORD_TABLE, mode)} />);
      expect(mockHeaderIcon).toBe(
        mode === 'OVERDUE_ATTENTION' ? IconClock : undefined,
      );
    },
  );
  it('keeps the saved retired widget remove action without invoking it automatically', () => {
    const saved = props(WidgetType.PERSONAL_FINANCE);
    render(<WidgetCardShell {...saved} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'This widget is no longer available.',
    );
    expect(saved.onRemove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Remove widget' }));
    expect(saved.onRemove).toHaveBeenCalledTimes(1);
    expect(mockHeaderIcon).toBeUndefined();
  });
});
