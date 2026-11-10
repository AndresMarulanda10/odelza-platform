import { renderHook } from '@testing-library/react';
import { indigo, teal } from '@radix-ui/colors';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { useInitializeRecordTableWidgetViewDraft } from '@/page-layout/widgets/record-table/hooks/useInitializeRecordTableWidgetViewDraft';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { buildRecordTableWidgetViewSnapshotFromView } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshotFromView';
import { type View } from '@/views/types/View';

const view = {
  id: 'private',
  objectMetadataId: 'company',
  isActive: true,
  type: 'TABLE_WIDGET',
  viewFields: [],
  viewFilters: [],
  viewSorts: [],
  viewGroups: [],
  timelineConfiguration: { barColor: indigo.indigo9 },
} as unknown as View;
const setup = (initial = buildRecordTableWidgetViewSnapshotFromView(view)) => {
  const store = createStore();
  const draft = recordTableWidgetViewDraftComponentState.atomFamily({
    instanceId: 'layout',
  });
  const persisted = recordTableWidgetViewPersistedComponentState.atomFamily({
    instanceId: 'layout',
  });
  store.set(draft, { unrelated: initial });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <PageLayoutComponentInstanceContext.Provider
        value={{ instanceId: 'layout' }}
      >
        {children}
      </PageLayoutComponentInstanceContext.Provider>
    </Provider>
  );
  return { store, draft, persisted, wrapper };
};

it('initializes a saved Timeline with no table columns and preserves its draft on reopen', () => {
  const { store, draft, persisted, wrapper } = setup();
  const { rerender } = renderHook(
    ({ saved }) =>
      useInitializeRecordTableWidgetViewDraft({
        widgetId: 'widget',
        view: saved,
        allowEmptyFields: true,
        pageLayoutId: 'layout',
      }),
    { wrapper, initialProps: { saved: view } },
  );
  expect(store.get(draft).widget?.view.timelineConfiguration).toEqual(
    view.timelineConfiguration,
  );
  const edited = {
    ...store.get(draft).widget,
    view: {
      ...store.get(draft).widget?.view,
      timelineConfiguration: { barColor: teal.teal9 },
    },
  } as ReturnType<typeof buildRecordTableWidgetViewSnapshotFromView>;
  store.set(draft, { ...store.get(draft), widget: edited });
  rerender({ saved: { ...view, timelineConfiguration: null } });
  expect(store.get(draft).widget).toBe(edited);
  expect(store.get(persisted).widget.view.timelineConfiguration).toEqual(
    view.timelineConfiguration,
  );
  expect(store.get(draft).unrelated).toBeDefined();
});

it('replaces a stale Timeline draft with the incoming view, not another widget', () => {
  const { store, draft, wrapper } = setup();
  const stale = buildRecordTableWidgetViewSnapshotFromView({
    ...view,
    id: 'old-private',
  });
  store.set(draft, { widget: stale, unrelated: stale });
  renderHook(
    () =>
      useInitializeRecordTableWidgetViewDraft({
        widgetId: 'widget',
        view,
        allowEmptyFields: true,
        pageLayoutId: 'layout',
      }),
    { wrapper },
  );
  expect(store.get(draft).widget.view.id).toBe('private');
  expect(store.get(draft).unrelated).toBe(stale);
});

it('keeps existing Table/Overdue empty-column initialization unchanged by default', () => {
  const { store, draft, wrapper } = setup();
  renderHook(
    () => useInitializeRecordTableWidgetViewDraft({ widgetId: 'widget', view }),
    { wrapper },
  );
  expect(store.get(draft).widget).toBeUndefined();
});

it('preserves a mismatched existing draft without Timeline opt-in', () => {
  const { store, draft, persisted, wrapper } = setup();
  const stale = buildRecordTableWidgetViewSnapshotFromView({
    ...view,
    id: 'previous-private',
    objectMetadataId: 'previous-source',
  });
  store.set(draft, { widget: stale, unrelated: stale });
  const before = JSON.stringify(store.get(draft));
  const persistedBefore = JSON.stringify(store.get(persisted));
  renderHook(
    () => useInitializeRecordTableWidgetViewDraft({ widgetId: 'widget', view }),
    { wrapper },
  );
  expect(JSON.stringify(store.get(draft))).toBe(before);
  expect(JSON.stringify(store.get(persisted))).toBe(persistedBefore);
  expect(store.get(draft).widget).toBe(stale);
});
