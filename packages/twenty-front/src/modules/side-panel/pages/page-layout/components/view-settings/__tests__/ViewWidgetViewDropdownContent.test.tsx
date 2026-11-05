import { fireEvent, render, screen } from '@testing-library/react';
import { ViewWidgetViewDropdownContent } from '@/side-panel/pages/page-layout/components/view-settings/ViewWidgetViewDropdownContent';
import {
  ViewType,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

const mockUpdateConfig = jest.fn();
const mockUpdateWidget = jest.fn();
const mockClose = jest.fn();
const mockViews = [
  { id: 'kanban', name: 'Board', type: ViewType.KANBAN, isActive: true },
  { id: 'timeline', name: 'Planning', type: ViewType.TIMELINE, isActive: true },
  { id: 'table', name: 'Table', type: ViewType.TABLE, isActive: true },
  {
    id: 'inactive',
    name: 'Private inactive',
    type: ViewType.TIMELINE,
    isActive: false,
  },
];
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
      objectMetadataId: 'task',
      configuration: {
        configurationType: WidgetConfigurationType.VIEW,
        viewId: 'kanban',
      },
    },
  }),
}));
jest.mock(
  '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig',
  () => ({
    useUpdateCurrentWidgetConfig: () => ({
      updateCurrentWidgetConfig: mockUpdateConfig,
    }),
  }),
);
jest.mock('@/page-layout/hooks/useUpdatePageLayoutWidget', () => ({
  useUpdatePageLayoutWidget: () => ({
    updatePageLayoutWidget: mockUpdateWidget,
  }),
}));
jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: () => ({ closeDropdown: mockClose }),
}));
jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({ useAvailableComponentInstanceIdOrThrow: () => 'dropdown' }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({ useAtomComponentStateValue: () => '' }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({ useAtomFamilySelectorValue: () => mockViews }),
);
jest.mock('@/ui/layout/selectable-list/components/SelectableList', () => ({
  SelectableList: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('@/ui/layout/dropdown/components/DropdownMenuSearchInput', () => ({
  DropdownMenuSearchInput: ({
    value,
    onChange,
    placeholder,
    autoFocus,
  }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
    />
  ),
}));

beforeEach(() => jest.clearAllMocks());
it('lists active Kanban and Timeline, searches neutrally and updates title/config', () => {
  render(<ViewWidgetViewDropdownContent />);
  expect(screen.getByText('Board')).toBeInTheDocument();
  expect(screen.queryByText('Table')).not.toBeInTheDocument();
  expect(screen.queryByText('Private inactive')).not.toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText('Search views'), {
    target: { value: 'Planning' },
  });
  expect(screen.queryByText('Board')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Planning'));
  expect(mockUpdateConfig).toHaveBeenCalledWith({
    configToUpdate: { viewId: 'timeline' },
  });
  expect(mockUpdateWidget).toHaveBeenCalledWith('widget', {
    title: 'Planning',
  });
  expect(mockClose).toHaveBeenCalledTimes(1);
});
it('retains Kanban selection behavior', () => {
  render(<ViewWidgetViewDropdownContent />);
  fireEvent.click(screen.getByText('Board'));
  expect(mockUpdateConfig).toHaveBeenCalledWith({
    configToUpdate: { viewId: 'kanban' },
  });
  expect(mockUpdateWidget).toHaveBeenCalledWith('widget', { title: 'Board' });
  expect(mockClose).toHaveBeenCalledTimes(1);
});
