import { act, renderHook } from '@testing-library/react';
import { useOpenWidgetSettingsInSidePanel } from '@/side-panel/hooks/useOpenWidgetSettingsInSidePanel';
import { IconClock } from 'twenty-ui/icon';
import { WidgetType } from '~/generated-metadata/graphql';

const mockNavigate = jest.fn();
const mockSet = jest.fn();
let mockMode: string | null = null;
jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({ useAvailableComponentInstanceIdOrThrow: () => 'layout' }),
);
jest.mock(
  '@/side-panel/pages/page-layout/hooks/useIsDashboardPageLayout',
  () => ({ useIsDashboardPageLayout: () => true }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState', () => ({
  useSetAtomComponentState: () => mockSet,
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomState', () => ({
  useSetAtomState: () => mockSet,
}));
jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
  () => ({
    useNavigatePageLayoutSidePanel: () => ({
      navigatePageLayoutSidePanel: mockNavigate,
    }),
  }),
);
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockSet }),
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => ({
      tabs: [
        {
          widgets: [
            {
              id: 'saved',
              configuration: {
                configurationType: 'RECORD_TABLE',
                presentationMode: mockMode,
              },
            },
          ],
        },
      ],
    }),
  }),
);

describe('saved widget settings navigation', () => {
  beforeEach(() => jest.clearAllMocks());
  it.each([null, 'TABLE', 'OVERDUE_ATTENTION'])(
    'overrides only overdue page icon (mode=%s)',
    (mode) => {
      mockMode = mode;
      const { result } = renderHook(() =>
        useOpenWidgetSettingsInSidePanel('layout'),
      );
      act(() =>
        result.current.openWidgetSettingsInSidePanel({
          widgetId: 'saved',
          widgetType: WidgetType.RECORD_TABLE,
        }),
      );
      expect(mockNavigate).toHaveBeenCalledWith({
        sidePanelPage: 'dashboard-record-table-settings',
        pageTitle: 'Edit Record Table',
        resetNavigationStack: true,
        ...(mode === 'OVERDUE_ATTENTION' ? { pageIcon: IconClock } : {}),
      });
    },
  );
  it('does not open active settings or mutate a saved retired widget', () => {
    const { result } = renderHook(() =>
      useOpenWidgetSettingsInSidePanel('layout'),
    );
    act(() =>
      result.current.openWidgetSettingsInSidePanel({
        widgetId: 'saved',
        widgetType: WidgetType.PERSONAL_FINANCE,
      }),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSet).not.toHaveBeenCalled();
  });
});
