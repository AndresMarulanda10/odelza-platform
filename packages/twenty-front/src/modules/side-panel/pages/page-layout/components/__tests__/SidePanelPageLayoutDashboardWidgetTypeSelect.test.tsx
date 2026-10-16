import { fireEvent, render, screen } from '@testing-library/react';

import { SidePanelPageLayoutDashboardWidgetTypeSelect } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutDashboardWidgetTypeSelect';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectPermissions } from 'twenty-shared/types';
import { IconClock, IconTable, type IconComponent } from 'twenty-ui/icon';

let mockObjects: EnrichedObjectMetadataItem[] = [];
let mockPermissions: Record<string, ObjectPermissions> = {};
let mockSelectableIds: string[] = [];
const mockMenuIcons: Record<string, IconComponent> = {};
const mockCreateTable = jest.fn(() => ({ id: 'overdue-id' }));
const mockAddDraft = jest.fn();
const mockUpdateWidget = jest.fn();
jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({
    objectPermissionsByObjectMetadataId: mockPermissions,
  }),
}));
jest.mock('@/page-layout/hooks/useUpdatePageLayoutWidget', () => ({
  useUpdatePageLayoutWidget: () => ({
    updatePageLayoutWidget: mockUpdateWidget,
  }),
}));

const mockCloseSidePanelMenu = jest.fn();
const mockCreatePageLayoutCardCarouselWidget = jest.fn(() => ({
  id: 'card-carousel-widget-id',
}));
const mockSetPageLayoutEditingWidgetId = jest.fn();
const mockNavigatePageLayoutSidePanel = jest.fn();
const mockCreateTimeline = jest.fn(() => ({ id: 'timeline-id' }));
const mockCreateView = jest.fn(() => ({ id: 'kanban-view-id' }));
jest.mock('@/page-layout/hooks/useCreatePageLayoutViewWidget', () => ({
  useCreatePageLayoutViewWidget: () => ({
    createPageLayoutViewWidget: mockCreateView,
  }),
}));
function mockEmptyHook() {
  return {};
}

function mockChildrenComponent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(() => ({ data: { frontComponents: [] } })),
}));

jest.mock('@/page-layout/hooks/useCreatePageLayoutGraphWidget', () => ({
  useCreatePageLayoutGraphWidget: mockEmptyHook,
}));
jest.mock('@/page-layout/hooks/useCreatePageLayoutIframeWidget', () => ({
  useCreatePageLayoutIframeWidget: mockEmptyHook,
}));
jest.mock(
  '@/page-layout/hooks/useCreatePageLayoutStandaloneRichTextWidget',
  () => ({ useCreatePageLayoutStandaloneRichTextWidget: mockEmptyHook }),
);
jest.mock(
  '@/page-layout/hooks/useCreatePageLayoutFrontComponentWidget',
  () => ({
    useCreatePageLayoutFrontComponentWidget: mockEmptyHook,
  }),
);
jest.mock('@/page-layout/hooks/useCreatePageLayoutRecordTableWidget', () => ({
  useCreatePageLayoutRecordTableWidget: () => ({
    createPageLayoutRecordTableWidget: mockCreateTable,
  }),
}));
jest.mock('@/page-layout/hooks/useCreatePageLayoutTaskTimelineWidget', () => ({
  useCreatePageLayoutTaskTimelineWidget: () => ({
    createPageLayoutTaskTimelineWidget: mockCreateTimeline,
  }),
}));
jest.mock('@/page-layout/hooks/useCreatePageLayoutCardCarouselWidget', () => ({
  useCreatePageLayoutCardCarouselWidget: () => ({
    createPageLayoutCardCarouselWidget: mockCreatePageLayoutCardCarouselWidget,
  }),
}));

jest.mock('@/page-layout/hooks/useOpportunityDefaultChartConfig', () => ({
  useOpportunityDefaultChartConfig: mockEmptyHook,
}));
jest.mock(
  '@/page-layout/widgets/record-table/hooks/useAddDraftViewForRecordTableWidget',
  () => ({
    useAddDraftViewForRecordTableWidget: () => ({
      addDraftViewForRecordTableWidget: mockAddDraft,
    }),
  }),
);
jest.mock(
  '@/page-layout/hooks/useRemovePageLayoutWidgetAndPreservePosition',
  () => ({ useRemovePageLayoutWidgetAndPreservePosition: mockEmptyHook }),
);

jest.mock('@/object-metadata/hooks/useReadableObjectMetadataItems', () => ({
  useReadableObjectMetadataItems: () => ({
    readableObjectMetadataItems: mockObjects,
  }),
}));
jest.mock(
  '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore',
  () => ({
    usePageLayoutIdFromContextStore: () => ({
      pageLayoutId: 'layout-id',
      recordId: null,
    }),
  }),
);
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockCloseSidePanelMenu }),
}));
jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
  () => ({
    useNavigatePageLayoutSidePanel: () => ({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    }),
  }),
);

jest.mock('@/page-layout/states/pageLayoutDraftComponentState', () => ({
  pageLayoutDraftComponentState: {},
}));
jest.mock(
  '@/page-layout/states/pageLayoutEditingWidgetIdComponentState',
  () => ({
    pageLayoutEditingWidgetIdComponentState: {},
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => ({ type: 'DASHBOARD', tabs: [] }),
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentState', () => ({
  useAtomComponentState: () => [null, mockSetPageLayoutEditingWidgetId],
}));
jest.mock(
  '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord',
  () => ({
    getTabListInstanceIdFromPageLayoutAndRecord: () => 'tab-list-id',
  }),
);

jest.mock('@/command-menu/components/CommandMenuItem', () => ({
  CommandMenuItem: ({
    label,
    onClick,
    Icon,
  }: {
    label: string;
    onClick: () => void;
    Icon: IconComponent;
  }) => {
    mockMenuIcons[label] = Icon;
    return (
      <button type="button" onClick={onClick}>
        {label}
      </button>
    );
  },
}));
jest.mock('@/side-panel/components/SidePanelList', () => ({
  SidePanelList: ({
    children,
    selectableItemIds,
  }: {
    children: React.ReactNode;
    selectableItemIds: string[];
  }) => {
    mockSelectableIds = selectableItemIds;
    return <div>{children}</div>;
  },
}));
jest.mock('@/side-panel/components/SidePanelGroup', () => ({
  SidePanelGroup: mockChildrenComponent,
}));
jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: mockChildrenComponent,
}));

describe('SidePanelPageLayoutDashboardWidgetTypeSelect', () => {
  it('opens Timeline settings immediately after creating an unconfigured draft', () => {
    render(<SidePanelPageLayoutDashboardWidgetTypeSelect />);
    fireEvent.click(screen.getByRole('button', { name: 'Task Timeline' }));
    expect(mockCreateTimeline).toHaveBeenCalledWith(undefined);
    expect(mockSetPageLayoutEditingWidgetId).toHaveBeenCalledWith(
      'timeline-id',
    );
    expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
      sidePanelPage: 'dashboard-task-timeline-settings',
      focusTitleInput: false,
    });
    expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    mockObjects = [];
    mockPermissions = {};
  });

  it('hides both the visual and keyboard preset until explicit permissions arrive', () => {
    mockObjects = [getMockObjectMetadataItemOrThrow('task')];
    const { rerender } = render(
      <SidePanelPageLayoutDashboardWidgetTypeSelect />,
    );
    expect(
      screen.queryByRole('button', { name: 'Overdue tasks' }),
    ).not.toBeInTheDocument();
    expect(mockSelectableIds).not.toContain('overdue-tasks');
    const task = mockObjects[0];
    mockPermissions = {
      [task.id]: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
    };
    rerender(<SidePanelPageLayoutDashboardWidgetTypeSelect />);
    expect(mockSelectableIds).toContain('overdue-tasks');
    mockPermissions[task.id].canReadObjectRecords = false;
    fireEvent.click(screen.getByRole('button', { name: 'Overdue tasks' }));
    expect(mockCreateTable).not.toHaveBeenCalled();
    mockPermissions[task.id].canReadObjectRecords = true;
    fireEvent.click(screen.getByRole('button', { name: 'Overdue tasks' }));
    expect(mockCreateTable).toHaveBeenCalledWith(task);
    expect(mockUpdateWidget).toHaveBeenCalledWith('overdue-id', {
      title: 'Overdue tasks',
    });
    expect(mockAddDraft).toHaveBeenCalledWith('overdue-id', task, {
      snapshot: expect.objectContaining({
        viewFilters: expect.arrayContaining([
          expect.objectContaining({ operand: 'IS_BEFORE_TODAY' }),
        ]),
      }),
      recordLimit: 5,
      presentationMode: 'OVERDUE_ATTENTION',
    });
    expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
      sidePanelPage: 'dashboard-record-table-settings',
      focusTitleInput: false,
      pageIcon: IconClock,
    });
    expect(mockMenuIcons['Overdue tasks']).toBe(IconClock);
    expect(mockMenuIcons.View).toBe(IconTable);
    mockPermissions = {};
    rerender(<SidePanelPageLayoutDashboardWidgetTypeSelect />);
    expect(mockSelectableIds).not.toContain('overdue-tasks');
    expect(
      screen.queryByRole('button', { name: 'Overdue tasks' }),
    ).not.toBeInTheDocument();
  });

  it('keeps ordinary View selection on its default native creation path', () => {
    mockObjects = [getMockObjectMetadataItemOrThrow('company')];
    render(<SidePanelPageLayoutDashboardWidgetTypeSelect />);
    fireEvent.click(screen.getByRole('button', { name: 'View' }));
    expect(mockCreateTable).toHaveBeenCalledWith(mockObjects[0]);
    expect(mockAddDraft).toHaveBeenCalledWith('overdue-id', mockObjects[0]);
    expect(mockUpdateWidget).not.toHaveBeenCalled();
    expect(mockMenuIcons.View).toBe(IconTable);
  });

  it('keeps the separate Kanban View path without replacing native table View', () => {
    mockObjects = [getMockObjectMetadataItemOrThrow('company')];
    render(<SidePanelPageLayoutDashboardWidgetTypeSelect />);
    expect(mockSelectableIds).toContain('view');
    fireEvent.click(screen.getByRole('button', { name: 'Kanban View' }));
    expect(mockCreateView).toHaveBeenCalledWith(mockObjects[0]);
    expect(mockSetPageLayoutEditingWidgetId).toHaveBeenCalledWith(
      'kanban-view-id',
    );
    expect(mockCreateTable).not.toHaveBeenCalled();
    expect(mockAddDraft).not.toHaveBeenCalled();
  });

  it('does not expose retired personal finance visually or to keyboard selection', () => {
    render(<SidePanelPageLayoutDashboardWidgetTypeSelect />);

    expect(
      screen.queryByRole('button', { name: 'Personal Finance' }),
    ).not.toBeInTheDocument();
    expect(mockSelectableIds).not.toContain('personal-finance');
    expect(mockSetPageLayoutEditingWidgetId).not.toHaveBeenCalled();
  });

  it('exposes the card carousel and routes selection to its draft creator', () => {
    render(<SidePanelPageLayoutDashboardWidgetTypeSelect />);

    expect(
      screen.getByRole('button', { name: 'Card Carousel' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Card Carousel' }));

    expect(mockCreatePageLayoutCardCarouselWidget).toHaveBeenCalledTimes(1);
    expect(mockSetPageLayoutEditingWidgetId).toHaveBeenCalledWith(
      'card-carousel-widget-id',
    );
    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
  });
});
