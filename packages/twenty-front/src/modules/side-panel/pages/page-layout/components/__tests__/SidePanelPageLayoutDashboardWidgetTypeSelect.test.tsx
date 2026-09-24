import { fireEvent, render, screen } from '@testing-library/react';

import { SidePanelPageLayoutDashboardWidgetTypeSelect } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutDashboardWidgetTypeSelect';

const mockCloseSidePanelMenu = jest.fn();
const mockCreatePageLayoutPersonalFinanceWidget = jest.fn(() => ({
  id: 'personal-finance-widget-id',
}));
const mockCreatePageLayoutCardCarouselWidget = jest.fn(() => ({
  id: 'card-carousel-widget-id',
}));
const mockSetPageLayoutEditingWidgetId = jest.fn();
function mockEmptyHook() {
  return {};
}

function mockChildrenComponent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(() => ({ data: { frontComponents: [] } })),
}));

jest.mock(
  '@/page-layout/hooks/useCreatePageLayoutPersonalFinanceWidget',
  () => ({
    useCreatePageLayoutPersonalFinanceWidget: () => ({
      createPageLayoutPersonalFinanceWidget:
        mockCreatePageLayoutPersonalFinanceWidget,
    }),
  }),
);
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
  useCreatePageLayoutRecordTableWidget: mockEmptyHook,
}));
jest.mock('@/page-layout/hooks/useCreatePageLayoutTaskTimelineWidget', () => ({
  useCreatePageLayoutTaskTimelineWidget: mockEmptyHook,
}));
jest.mock(
  '@/page-layout/hooks/useCreatePageLayoutCardCarouselWidget',
  () => ({
    useCreatePageLayoutCardCarouselWidget: () => ({
      createPageLayoutCardCarouselWidget: mockCreatePageLayoutCardCarouselWidget,
    }),
  }),
);

jest.mock('@/page-layout/hooks/useOpportunityDefaultChartConfig', () => ({
  useOpportunityDefaultChartConfig: mockEmptyHook,
}));
jest.mock(
  '@/page-layout/widgets/record-table/hooks/useAddDraftViewForRecordTableWidget',
  () => ({ useAddDraftViewForRecordTableWidget: mockEmptyHook }),
);
jest.mock(
  '@/page-layout/hooks/useRemovePageLayoutWidgetAndPreservePosition',
  () => ({ useRemovePageLayoutWidgetAndPreservePosition: mockEmptyHook }),
);

jest.mock('@/object-metadata/hooks/useReadableObjectMetadataItems', () => ({
  useReadableObjectMetadataItems: () => ({ readableObjectMetadataItems: [] }),
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
    useNavigatePageLayoutSidePanel: mockEmptyHook,
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
  }: {
    label: string;
    onClick: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  ),
}));
jest.mock('@/side-panel/components/SidePanelList', () => ({
  SidePanelList: mockChildrenComponent,
}));
jest.mock('@/side-panel/components/SidePanelGroup', () => ({
  SidePanelGroup: mockChildrenComponent,
}));
jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: mockChildrenComponent,
}));

describe('SidePanelPageLayoutDashboardWidgetTypeSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes personal finance and routes selection to its draft creator', () => {
    render(<SidePanelPageLayoutDashboardWidgetTypeSelect />);

    expect(
      screen.getByRole('button', { name: 'Personal Finance' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Personal Finance' }));

    expect(mockCreatePageLayoutPersonalFinanceWidget).toHaveBeenCalledTimes(1);
    expect(mockSetPageLayoutEditingWidgetId).toHaveBeenCalledWith(
      'personal-finance-widget-id',
    );
    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
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
