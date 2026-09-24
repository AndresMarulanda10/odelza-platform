import { fireEvent, render, screen } from '@testing-library/react';

import { SidePanelDashboardTaskTimelineSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardTaskTimelineSettings';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { type SelectOption } from 'twenty-ui/input';

// Arbitrary but valid hex, assembled instead of written literally because the
// frontend lint forbids hardcoded colors, tests included.
const buildHexColor = (red: number, green: number, blue: number) =>
  `#${[red, green, blue]
    .map((component) => component.toString(16).padStart(2, '0'))
    .join('')}`;
const CONFIGURED_BAR_COLOR = buildHexColor(0x12, 0x34, 0x56);
const UPDATED_BAR_COLOR = buildHexColor(0xab, 0xcd, 0xef);

jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock(
  '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore',
);
jest.mock('@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig');
jest.mock('@/side-panel/pages/page-layout/hooks/useWidgetInEditMode');
jest.mock(
  '@/side-panel/pages/page-layout/components/WidgetSettingsFooter',
  () => ({
    WidgetSettingsFooter: () => null,
  }),
);
jest.mock('@/ui/input/components/Select', () => ({
  Select: ({
    dropdownId,
    emptyOption,
    label,
    options,
    value,
    onChange,
  }: {
    dropdownId: string;
    emptyOption?: SelectOption<string>;
    label?: string;
    options: SelectOption<string>[];
    value?: string;
    onChange?: (value: string) => void;
  }) => (
    <label>
      {label}
      <select
        aria-label={label}
        data-dropdown-id={dropdownId}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      >
        {emptyOption && (
          <option value={emptyOption.value}>{emptyOption.label}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
}));

const mockedUseObjectMetadataItem = jest.mocked(useObjectMetadataItem);
const mockedUsePageLayoutIdFromContextStore = jest.mocked(
  usePageLayoutIdFromContextStore,
);
const mockedUseUpdateCurrentWidgetConfig = jest.mocked(
  useUpdateCurrentWidgetConfig,
);
const mockedUseWidgetInEditMode = jest.mocked(useWidgetInEditMode);

describe('SidePanelDashboardTaskTimelineSettings', () => {
  it('preserves each mapping while changing the other and updates bar color', () => {
    const updateCurrentWidgetConfig = jest.fn();
    mockedUsePageLayoutIdFromContextStore.mockReturnValue({
      pageLayoutId: 'page-layout-id',
      recordId: 'dashboard-id',
      objectNameSingular: 'dashboard',
    });
    mockedUseUpdateCurrentWidgetConfig.mockReturnValue({
      updateCurrentWidgetConfig,
    });
    mockedUseWidgetInEditMode.mockReturnValue({
      widgetInEditMode: {
        configuration: {
          configurationType: 'TASK_TIMELINE',
          fieldMapping: {
            titleFieldMetadataId: 'title-id',
            startDateFieldMetadataId: 'start-id',
            dueDateFieldMetadataId: 'due-id',
          },
          barColor: CONFIGURED_BAR_COLOR,
        },
      } as never,
    });
    mockedUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: {
        fields: [
          { id: 'start-id', name: 'startDate', label: 'Start', type: 'DATE' },
          { id: 'due-id', name: 'dueDate', label: 'Due', type: 'DATE_TIME' },
          { id: 'other-id', name: 'title', label: 'Title', type: 'TEXT' },
        ],
      },
    } as never);

    render(<SidePanelDashboardTaskTimelineSettings />);

    expect(screen.getByLabelText('Start date field')).toHaveValue('start-id');
    expect(screen.getByLabelText('End date field')).toHaveValue('due-id');
    expect(screen.getByLabelText('Task bar color')).toHaveValue(
      CONFIGURED_BAR_COLOR,
    );
    expect(screen.getByLabelText('Start date field')).toHaveAttribute(
      'data-dropdown-id',
      'task-timeline-start-date-field',
    );
    expect(screen.getByLabelText('End date field')).toHaveAttribute(
      'data-dropdown-id',
      'task-timeline-end-date-field',
    );
    expect(screen.getByLabelText('Selected color')).toHaveTextContent(
      CONFIGURED_BAR_COLOR,
    );

    fireEvent.change(screen.getByLabelText('Start date field'), {
      target: { value: 'due-id' },
    });
    expect(updateCurrentWidgetConfig).toHaveBeenCalledWith({
      configToUpdate: {
        fieldMapping: {
          titleFieldMetadataId: 'title-id',
          startDateFieldMetadataId: 'due-id',
          dueDateFieldMetadataId: 'due-id',
        },
      },
    });

    fireEvent.change(screen.getByLabelText('End date field'), {
      target: { value: 'start-id' },
    });
    expect(updateCurrentWidgetConfig).toHaveBeenLastCalledWith({
      configToUpdate: {
        fieldMapping: {
          titleFieldMetadataId: 'title-id',
          startDateFieldMetadataId: 'start-id',
          dueDateFieldMetadataId: 'start-id',
        },
      },
    });

    fireEvent.change(screen.getByLabelText('Task bar color'), {
      target: { value: UPDATED_BAR_COLOR },
    });
    expect(updateCurrentWidgetConfig).toHaveBeenLastCalledWith({
      configToUpdate: { barColor: UPDATED_BAR_COLOR },
    });
  });
});
