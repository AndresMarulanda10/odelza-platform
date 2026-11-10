import { fireEvent, render, screen } from '@testing-library/react';
import { ODELZA_THEME_LIGHT } from 'twenty-ui/theme';
import { createStore, Provider } from 'jotai';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { RecordTableTimelineSettings } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableTimelineSettings';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { FieldMetadataType } from 'twenty-shared/types';
import { type View } from '@/views/types/View';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';

let mockSavedView: View | undefined;
jest.mock('@/views/hooks/useViewById', () => ({
  useViewById: () => ({ view: mockSavedView }),
}));
jest.mock('@/command-menu/hooks/useCommandMenuOnItemClick', () => ({
  useCommandMenuOnItemClick: () => ({
    onItemClick: ({ onClick }: { onClick?: () => void }) => onClick?.(),
  }),
}));

let mockRead = true;
const dateFields = [
  {
    id: 'start',
    universalIdentifier: 'start-universal',
    name: 'createdAt',
    label: 'Created date',
    isActive: true,
    type: FieldMetadataType.DATE_TIME,
  },
  {
    id: 'secret',
    universalIdentifier: 'secret-universal',
    name: 'secretDate',
    label: 'Private date',
    isActive: true,
    type: FieldMetadataType.DATE,
  },
];
const source = {
  id: 'company',
  isActive: true,
  fields: dateFields,
  readableFields: dateFields,
};
jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: () => ({ objectMetadataItem: source }),
}));
jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({
    objectPermissionsByObjectMetadataId: {
      company: {
        canReadObjectRecords: mockRead,
        restrictedFields: { secret: { canRead: false } },
      },
    },
  }),
}));

it('edits readable generic-source dates and color only in the widget draft, preserving other state', () => {
  mockRead = true;
  i18n.load('en', {});
  i18n.activate('en');
  const store = createStore();
  const atom = recordTableWidgetViewDraftComponentState.atomFamily({
    instanceId: 'layout',
  });
  const snapshot = {
    view: {
      id: 'private',
      objectMetadataId: 'company',
      timelineConfiguration: { barColor: ODELZA_THEME_LIGHT.color.blue },
    },
    viewFields: [{ fieldMetadataId: 'name' }],
    viewFilters: [{ id: 'filter' }],
    viewFilterGroups: [],
    viewSorts: [{ id: 'sort' }],
  } as unknown as RecordTableWidgetViewSnapshot;
  store.set(atom, { widget: snapshot, untouched: snapshot });
  const persisted = recordTableWidgetViewPersistedComponentState.atomFamily({
    instanceId: 'layout',
  });
  store.set(persisted, { widget: snapshot, untouched: snapshot });
  const { rerender } = render(
    <Provider store={store}>
      <SelectableListComponentInstanceContext.Provider
        value={{ instanceId: 'settings' }}
      >
        <I18nProvider i18n={i18n}>
          <RecordTableTimelineSettings
            pageLayoutId="layout"
            widgetId="widget"
            viewId="private"
            objectMetadataId="company"
          />
        </I18nProvider>
      </SelectableListComponentInstanceContext.Provider>
    </Provider>,
  );
  fireEvent.click(screen.getByText('Start date'));
  expect(screen.queryByText('Private date')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Created date'));
  fireEvent.click(screen.getByText('Bar color'));
  fireEvent.change(screen.getByPlaceholderText('Hex color'), {
    target: { value: ODELZA_THEME_LIGHT.color.turquoise },
  });
  const updated = store.get(atom);
  expect(updated.widget.view.timelineConfiguration).toMatchObject({
    startDateFieldMetadataUniversalIdentifier: 'start-universal',
    barColor: ODELZA_THEME_LIGHT.color.turquoise,
  });
  expect(updated.widget.view.id).toBe('private');
  expect(updated.widget.viewFields).toBe(snapshot.viewFields);
  expect(updated.widget.viewFilters).toBe(snapshot.viewFilters);
  expect(updated.widget.viewSorts).toBe(snapshot.viewSorts);
  expect(updated.untouched).toBe(snapshot);
  expect(store.get(persisted).widget).toBe(snapshot);
  const before = JSON.stringify(updated);
  mockRead = false;
  rerender(
    <Provider store={store}>
      <SelectableListComponentInstanceContext.Provider
        value={{ instanceId: 'settings' }}
      >
        <I18nProvider i18n={i18n}>
          <RecordTableTimelineSettings
            pageLayoutId="layout"
            widgetId="widget"
            viewId="private"
            objectMetadataId="company"
          />
        </I18nProvider>
      </SelectableListComponentInstanceContext.Provider>
    </Provider>,
  );
  fireEvent.change(screen.getByPlaceholderText('Hex color'), {
    target: { value: ODELZA_THEME_LIGHT.color.gray },
  });
  expect(JSON.stringify(store.get(atom))).toBe(before);
});

it('opens saved private Timeline settings with no draft or table columns and changes both dates', () => {
  mockRead = true;
  i18n.load('en', {});
  i18n.activate('en');
  mockSavedView = {
    id: 'private',
    objectMetadataId: 'company',
    type: 'TABLE_WIDGET',
    isActive: true,
    viewFields: [],
    viewFilters: [],
    viewSorts: [],
    viewGroups: [],
    timelineConfiguration: null,
  } as unknown as View;
  const store = createStore();
  const atom = recordTableWidgetViewDraftComponentState.atomFamily({
    instanceId: 'layout',
  });
  render(
    <Provider store={store}>
      <SelectableListComponentInstanceContext.Provider
        value={{ instanceId: 'settings' }}
      >
        <I18nProvider i18n={i18n}>
          <RecordTableTimelineSettings
            pageLayoutId="layout"
            widgetId="widget"
            viewId="private"
            objectMetadataId="company"
          />
        </I18nProvider>
      </SelectableListComponentInstanceContext.Provider>
    </Provider>,
  );
  fireEvent.click(screen.getByText('Start date'));
  fireEvent.change(screen.getByPlaceholderText('Search fields'), {
    target: { value: 'Created' },
  });
  fireEvent.click(screen.getByText('Created date'));
  expect(
    screen.queryByPlaceholderText('Search fields'),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('End date'));
  fireEvent.click(screen.getAllByText('Created date').at(-1)!);
  expect(store.get(atom).widget.view.timelineConfiguration).toEqual({
    startDateFieldMetadataUniversalIdentifier: 'start-universal',
    endDateFieldMetadataUniversalIdentifier: 'start-universal',
  });
  fireEvent.click(screen.getByText('Start date'));
  fireEvent.click(screen.getAllByText('Not configured').at(-1)!);
  expect(
    store.get(atom).widget.view.timelineConfiguration
      ?.startDateFieldMetadataUniversalIdentifier,
  ).toBeNull();
  mockSavedView = undefined;
});

it('does not initialize from a stale source response or display another view configuration', () => {
  mockRead = true;
  mockSavedView = {
    id: 'old-private',
    objectMetadataId: 'other-source',
    isActive: true,
    type: 'TABLE_WIDGET',
    viewFields: [],
    viewFilters: [],
    viewSorts: [],
  } as unknown as View;
  const store = createStore();
  const atom = recordTableWidgetViewDraftComponentState.atomFamily({
    instanceId: 'layout',
  });
  const previous = {
    view: {
      id: 'old-private',
      objectMetadataId: 'other-source',
      timelineConfiguration: {
        startDateFieldMetadataUniversalIdentifier: 'start-universal',
      },
    },
  } as unknown as RecordTableWidgetViewSnapshot;
  store.set(atom, { widget: previous });
  render(
    <Provider store={store}>
      <SelectableListComponentInstanceContext.Provider
        value={{ instanceId: 'settings' }}
      >
        <I18nProvider i18n={i18n}>
          <RecordTableTimelineSettings
            pageLayoutId="layout"
            widgetId="widget"
            viewId="private"
            objectMetadataId="company"
          />
        </I18nProvider>
      </SelectableListComponentInstanceContext.Provider>
    </Provider>,
  );
  expect(screen.queryByText('Created date')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(
    'Timeline settings are unavailable',
  );
  fireEvent.click(screen.getByText('Start date'));
  expect(
    screen.queryByPlaceholderText('Search fields'),
  ).not.toBeInTheDocument();
  expect(store.get(atom).widget).toBe(previous);
  mockSavedView = undefined;
});
