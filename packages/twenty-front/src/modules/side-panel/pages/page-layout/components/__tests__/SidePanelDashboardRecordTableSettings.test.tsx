import { render } from '@testing-library/react';
import { SidePanelDashboardRecordTableSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardRecordTableSettings';
import { IconClock, IconTable, type IconComponent } from 'twenty-ui/icon';

let mockMode: string | null;
let mockLayoutIcon: IconComponent;
let mockDescription: string;
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
        configurationType: 'RECORD_TABLE',
        presentationMode: mockMode,
      },
    },
  }),
}));
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
      updateCurrentWidgetConfig: jest.fn(),
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
  }: {
    id: string;
    Icon: IconComponent;
    description: string;
  }) => {
    if (id === 'object-view-layout') {
      mockLayoutIcon = Icon;
      mockDescription = description;
    }
    return null;
  },
}));

it.each([null, 'TABLE', 'OVERDUE_ATTENTION'])(
  'settings layout icon is scoped to mode %s',
  (mode) => {
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
