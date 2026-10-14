import { fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { Provider, createStore } from 'jotai';
import { indigo } from '@radix-ui/colors';
import { SidePanelDashboardTaskTimelineSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardTaskTimelineSettings';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { emptyTimelineMapping } from '@/page-layout/widgets/task-timeline/utils/timelineSource';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems');
jest.mock('@/object-record/hooks/useObjectPermissions');
jest.mock('@/side-panel/pages/page-layout/hooks/useWidgetInEditMode');
jest.mock('@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig');
jest.mock(
  '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore',
  () => ({
    usePageLayoutIdFromContextStore: () => ({ pageLayoutId: 'layout' }),
  }),
);
jest.mock(
  '@/side-panel/pages/page-layout/components/WidgetSettingsFooter',
  () => ({ WidgetSettingsFooter: () => null }),
);
jest.mock('@/command-menu/hooks/useCommandMenuOnItemClick', () => ({
  useCommandMenuOnItemClick: () => ({
    onItemClick: ({ onClick }: { onClick?: () => void }) => onClick?.(),
  }),
}));

const color = `#${['12', '34', '56'].join('')}`;
const update = jest.fn();
const field = (id: string, type = 'DATE', isActive = true) => ({
  id,
  type,
  name: id,
  label: id,
  isActive,
});
const project = {
  id: 'project',
  nameSingular: 'project',
  labelSingular: 'Project',
  labelPlural: 'Projects',
  isActive: true,
  fields: [
    field('kickoff'),
    field('delivery'),
    field('caption', 'TEXT'),
    field('inactive', 'DATE', false),
    field('secret'),
  ],
  readableFields: [
    field('kickoff'),
    field('delivery'),
    field('caption', 'TEXT'),
    field('inactive', 'DATE', false),
  ],
} as unknown as EnrichedObjectMetadataItem;
const task = {
  ...project,
  id: 'task',
  nameSingular: 'task',
  labelPlural: 'Tasks',
};
let draft: PageLayoutWidget;

function mount() {
  return render(
    <Provider store={createStore()}>
      <I18nProvider i18n={i18n}>
        <SidePanelDashboardTaskTimelineSettings />
      </I18nProvider>
    </Provider>,
  );
}
const click = (text: string) =>
  fireEvent.click(screen.getAllByText(text, { exact: true }).at(-1)!);

describe('Timeline native configuration controls (no Select/control mocks)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    draft = {
      id: 'widget',
      objectMetadataId: project.id,
      configuration: {
        __typename: 'TaskTimelineConfiguration',
        configurationType: 'TASK_TIMELINE',
        fieldMapping: {
          titleFieldMetadataId: 'caption',
          startDateFieldMetadataId: 'kickoff',
          dueDateFieldMetadataId: 'delivery',
          dependencyFieldMetadataId: 'old-relation',
        },
        barColor: color,
      },
    } as PageLayoutWidget;
    jest
      .mocked(useWidgetInEditMode)
      .mockImplementation(
        () =>
          ({ widgetInEditMode: draft }) as ReturnType<
            typeof useWidgetInEditMode
          >,
      );
    jest.mocked(useObjectMetadataItems).mockReturnValue({
      objectMetadataItems: [
        project,
        task,
        { ...project, id: 'deleted', isActive: false },
        { ...project, id: 'denied', labelPlural: 'Denied' },
      ],
    });
    jest.mocked(useObjectPermissions).mockReturnValue({
      objectPermissionsByObjectMetadataId: {
        denied: { objectMetadataId: 'denied', canReadObjectRecords: false },
      },
    } as unknown as ReturnType<typeof useObjectPermissions>);
    jest
      .mocked(useUpdateCurrentWidgetConfig)
      .mockReturnValue({ updateCurrentWidgetConfig: update });
  });

  it('searches active readable sources and resets every role atomically', () => {
    mount();
    click('Source');
    expect(screen.queryByText('Denied')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search objects'), {
      target: { value: 'tasks' },
    });
    expect(
      screen.queryByText('Projects', { selector: '[data-selectable-item-id]' }),
    ).not.toBeInTheDocument();
    click('Tasks');
    expect(update).toHaveBeenLastCalledWith({
      objectMetadataId: task.id,
      configToUpdate: { fieldMapping: emptyTimelineMapping() },
    });
  });

  it('exposes native Fields/date submenus, preserves other mappings, and filters field kinds/activity/readability', () => {
    mount();
    click('Fields');
    click('Start date field');
    expect(screen.queryByText('inactive')).not.toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search fields'), {
      target: { value: 'delivery' },
    });
    click('delivery');
    expect(update).toHaveBeenLastCalledWith({
      configToUpdate: {
        fieldMapping: {
          ...(draft.configuration as { fieldMapping: object }).fieldMapping,
          startDateFieldMetadataId: 'delivery',
        },
      },
    });
  });

  it('allows clearing and reselecting the only compatible field', () => {
    jest.mocked(useObjectMetadataItems).mockReturnValue({
      objectMetadataItems: [
        {
          ...project,
          fields: [field('kickoff')],
          readableFields: [field('kickoff')],
        } as unknown as EnrichedObjectMetadataItem,
      ],
    });
    mount();
    click('Fields');
    click('Start date field');
    click('Not configured');
    expect(
      update.mock.calls.at(-1)?.[0].configToUpdate.fieldMapping
        .startDateFieldMetadataId,
    ).toBeNull();
    click('Start date field');
    click('kickoff');
    expect(
      update.mock.calls.at(-1)?.[0].configToUpdate.fieldMapping
        .startDateFieldMetadataId,
    ).toBe('kickoff');
  });

  it('excludes fields denied by permission even when readable metadata is stale', () => {
    jest.mocked(useObjectPermissions).mockReturnValue({
      objectPermissionsByObjectMetadataId: {
        project: {
          objectMetadataId: 'project',
          canReadObjectRecords: true,
          restrictedFields: { kickoff: { canRead: false } },
        },
      },
    } as unknown as ReturnType<typeof useObjectPermissions>);
    mount();
    click('Fields');
    click('Start date field');
    fireEvent.change(screen.getByPlaceholderText('Search fields'), {
      target: { value: 'kickoff' },
    });
    expect(
      screen.getByText(
        'No readable compatible fields. Choose another source or update its fields.',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Unavailable field')).toHaveLength(1);
  });

  it('provides zero-option guidance and exposes explicit unavailable mappings', () => {
    jest.mocked(useObjectMetadataItems).mockReturnValue({
      objectMetadataItems: [{ ...project, fields: [], readableFields: [] }],
    });
    mount();
    click('Fields');
    click('Start date field');
    expect(
      screen.getByText(
        'No readable compatible fields. Choose another source or update its fields.',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Unavailable field').length).toBeGreaterThan(0);
  });

  it('displays Task null date mappings as Automatic without silently resetting an arbitrary color', () => {
    draft = {
      ...draft,
      objectMetadataId: task.id,
      configuration: { ...draft.configuration, fieldMapping: null },
    } as PageLayoutWidget;
    mount();
    click('Fields');
    expect(screen.getAllByText('Automatic')).toHaveLength(2);
    expect(update).not.toHaveBeenCalled();
    click('Bar color');
    expect(screen.getByPlaceholderText('Hex color')).toHaveValue(color);
    const next = `#${['ab', 'cd', 'ef'].join('')}`;
    fireEvent.change(screen.getByPlaceholderText('Hex color'), {
      target: { value: next },
    });
    expect(update).toHaveBeenLastCalledWith({
      configToUpdate: { barColor: next },
    });
  });

  it('exposes compatible label fields and permits clearing the source', () => {
    mount();
    click('Fields');
    click('Title field');
    click('caption');
    expect(
      update.mock.calls.at(-1)?.[0].configToUpdate.fieldMapping
        .titleFieldMetadataId,
    ).toBe('caption');
    click('Source');
    click('Not configured');
    expect(update).toHaveBeenLastCalledWith({
      objectMetadataId: null,
      configToUpdate: { fieldMapping: emptyTimelineMapping() },
    });
  });

  it('persists a native palette choice as contract-compatible hex', () => {
    mount();
    click('Bar color');
    click('Blue');
    expect(update).toHaveBeenLastCalledWith({
      configToUpdate: { barColor: indigo.indigo9 },
    });
    expect(screen.getByPlaceholderText('Hex color')).toHaveValue(
      indigo.indigo9,
    );
  });
});
