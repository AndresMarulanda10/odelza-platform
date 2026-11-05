import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { RecordTableTimelineSettings } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableTimelineSettings';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { FieldMetadataType } from 'twenty-shared/types';

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
jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
jest.mock('@/command-menu/components/CommandMenuItemDropdown', () => ({
  CommandMenuItemDropdown: ({
    dropdownComponents,
  }: {
    dropdownComponents: React.ReactNode;
  }) => <>{dropdownComponents}</>,
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
      timelineConfiguration: { barColor: '#123456' },
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
      <I18nProvider i18n={i18n}>
        <RecordTableTimelineSettings
          pageLayoutId="layout"
          widgetId="widget"
          viewId="private"
          objectMetadataId="company"
        />
      </I18nProvider>
    </Provider>,
  );
  fireEvent.click(screen.getAllByText('Not configured')[0]);
  expect(screen.queryByText('Private date')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Created date'));
  fireEvent.change(screen.getByPlaceholderText('Hex color'), {
    target: { value: '#abcdef' },
  });
  const updated = store.get(atom);
  expect(updated.widget.view.timelineConfiguration).toMatchObject({
    startDateFieldMetadataUniversalIdentifier: 'start-universal',
    barColor: '#abcdef',
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
      <I18nProvider i18n={i18n}>
        <RecordTableTimelineSettings
          pageLayoutId="layout"
          widgetId="widget"
          viewId="private"
          objectMetadataId="company"
        />
      </I18nProvider>
    </Provider>,
  );
  fireEvent.change(screen.getByPlaceholderText('Hex color'), {
    target: { value: '#000000' },
  });
  expect(JSON.stringify(store.get(atom))).toBe(before);
});
