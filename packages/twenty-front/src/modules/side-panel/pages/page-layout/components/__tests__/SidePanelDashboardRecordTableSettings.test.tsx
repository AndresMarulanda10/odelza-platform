import { fireEvent, render, screen } from '@testing-library/react';
import { SidePanelDashboardRecordTableSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardRecordTableSettings';
import {
  IconClock,
  IconTable,
  IconTimelineEvent,
  type IconComponent,
} from 'twenty-ui/icon';

let mockMode: string | null;
let mockConfigurationType = 'RECORD_TABLE';
let mockLayoutIcon: IconComponent;
let mockDescription: string;
let mockDisabled: boolean;
let mockExposeLayout = false;
const mockUpdateConfig = jest.fn();
jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: () => ({ closeDropdown: jest.fn() }),
}));
jest.mock('@/ui/layout/selectable-list/components/SelectableList', () => ({
  SelectableList: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
jest.mock(
  '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore',
  () => ({
    usePageLayoutIdFromContextStore: () => ({ pageLayoutId: 'layout' }),
  }),
);
jest.mock('@/side-panel/pages/page-layout/hooks/useWidgetInEditMode', () => ({
  useWidgetInEditMode: () => ({
    widgetInEditMode: {
      id: 'widget',
      configuration: {
        configurationType: mockConfigurationType,
        presentationMode: mockMode,
      },
    },
  }),
}));
jest.mock(
  '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardViewSettings',
  () => ({
    SidePanelDashboardViewSettings: () => <div data-testid="view-settings" />,
  }),
);
jest.mock('@/side-panel/hooks/useSidePanelSubPageHistory', () => ({
  useSidePanelSubPageHistory: () => ({ navigateToSidePanelSubPage: jest.fn() }),
}));
jest.mock(
  '@/side-panel/pages/page-layout/hooks/useRecordTableSettingsDescriptions',
  () => ({ useRecordTableSettingsDescriptions: () => ({}) }),
);
jest.mock(
  '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig',
  () => ({
    useUpdateCurrentWidgetConfig: () => ({
      updateCurrentWidgetConfig: mockUpdateConfig,
    }),
  }),
);
jest.mock(
  '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetFieldCallbacks',
  () => ({ useRecordTableWidgetFieldCallbacks: () => ({}) }),
);
jest.mock(
  '@/side-panel/pages/page-layout/components/WidgetSettingsFooter',
  () => ({ WidgetSettingsFooter: () => null }),
);
jest.mock('@/side-panel/components/SidePanelList', () => ({
  SidePanelList: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
jest.mock('@/command-menu/components/CommandMenuItemDropdown', () => ({
  CommandMenuItemDropdown: ({
    id,
    Icon,
    description,
    disabled,
    dropdownComponents,
  }: {
    id: string;
    Icon: IconComponent;
    description: string;
    disabled: boolean;
    dropdownComponents: React.ReactNode;
  }) => {
    if (id === 'object-view-layout') {
      mockLayoutIcon = Icon;
      mockDescription = description;
      mockDisabled = disabled;
      if (mockExposeLayout) return <>{dropdownComponents}</>;
    }
    return null;
  },
}));

it('enables Table/Timeline only for the real View layout and leaves Overdue locked', () => {
  mockConfigurationType = 'RECORD_TABLE';
  mockExposeLayout = true;
  mockMode = 'TABLE';
  const { rerender } = render(<SidePanelDashboardRecordTableSettings />);
  expect(mockDisabled).toBe(false);
  fireEvent.click(screen.getByText('Timeline'));
  expect(mockUpdateConfig).toHaveBeenLastCalledWith({
    configToUpdate: { presentationMode: 'TIMELINE' },
  });
  mockMode = 'TIMELINE';
  rerender(<SidePanelDashboardRecordTableSettings />);
  expect(mockDescription).toBe('Timeline');
  expect(mockLayoutIcon).toBe(IconTimelineEvent);
  fireEvent.click(screen.getByText('Table'));
  expect(mockUpdateConfig).toHaveBeenLastCalledWith({
    configToUpdate: { presentationMode: 'TABLE' },
  });
  mockMode = 'OVERDUE_ATTENTION';
  rerender(<SidePanelDashboardRecordTableSettings />);
  expect(mockDisabled).toBe(true);
  mockExposeLayout = false;
});

it.each([null, 'TABLE', 'OVERDUE_ATTENTION'])(
  'settings layout icon is scoped to mode %s',
  (mode) => {
    mockConfigurationType = 'RECORD_TABLE';
    mockMode = mode;
    render(<SidePanelDashboardRecordTableSettings />);
    expect(mockLayoutIcon).toBe(
      mode === 'OVERDUE_ATTENTION' ? IconClock : IconTable,
    );
    expect(mockDescription).toBe(
      mode === 'OVERDUE_ATTENTION' ? 'Overdue tasks' : 'Table',
    );
  },
);

it('routes main View widgets to their own settings instead of native table settings', () => {
  mockConfigurationType = 'VIEW';
  render(<SidePanelDashboardRecordTableSettings />);
  expect(screen.getByTestId('view-settings')).toBeInTheDocument();
});
