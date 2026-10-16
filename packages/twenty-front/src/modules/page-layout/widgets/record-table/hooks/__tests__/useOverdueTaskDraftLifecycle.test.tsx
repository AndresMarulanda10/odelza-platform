import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { useAddDraftViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForRecordTableWidget';
import { useSaveRecordTableWidgetViews } from '@/page-layout/hooks/useSaveRecordTableWidgetViews';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import { buildOverdueTaskRecordTableWidgetPreset } from '@/page-layout/widgets/record-table/utils/buildOverdueTaskRecordTableWidgetPreset';
import { type ObjectPermissions } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { createDefaultRecordTableWidget } from '@/page-layout/utils/createDefaultRecordTableWidget';

import { type UpsertViewWidgetInput } from '~/generated-metadata/graphql';

const mockUpsert = jest.fn(
  async (_options: { variables: { input: UpsertViewWidgetInput } }) => ({}),
);
jest.mock('@apollo/client/react', () => ({ useMutation: () => [mockUpsert] }));

describe('native overdue task draft lifecycle (offline)', () => {
  const task = getMockObjectMetadataItemOrThrow('task');
  const permission: ObjectPermissions = {
    canReadObjectRecords: true,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  };
  const snapshot = () =>
    buildOverdueTaskRecordTableWidgetPreset(task, { [task.id]: permission })!;
  const draftAtom = recordTableWidgetViewDraftComponentState.atomFamily({
    instanceId: 'layout',
  });
  const persistedAtom = recordTableWidgetViewPersistedComponentState.atomFamily(
    { instanceId: 'layout' },
  );
  const layoutAtom = pageLayoutDraftComponentState.atomFamily({
    instanceId: 'layout',
  });
  let frames: FrameRequestCallback[];

  beforeEach(() => {
    mockUpsert.mockClear();
    frames = [];
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        frames.push(callback);
        return frames.length;
      });
  });
  afterEach(() => jest.restoreAllMocks());

  const setup = () => {
    const store = createStore();
    const widget = createDefaultRecordTableWidget({
      id: 'widget',
      pageLayoutTabId: 'tab',
      title: 'Overdue tasks',
      gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
      objectMetadataId: task.id,
    });
    store.set(layoutAtom, {
      ...store.get(layoutAtom),
      tabs: [
        {
          id: 'tab',
          title: 'Tab',
          position: 0,
          widgets: [widget],
          pageLayoutId: 'layout',
          applicationId: 'application',
          createdAt: '',
          updatedAt: '',
          isActive: true,
        },
      ],
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const hook = renderHook(
      () => ({
        ...useAddDraftViewForRecordTableWidget('layout'),
        ...useSaveRecordTableWidgetViews(),
      }),
      { wrapper },
    );
    return { store, ...hook };
  };

  it('carries the complete native draft through RAF and the actual save payload/persisted snapshot', async () => {
    const { store, result } = setup();
    const preset = snapshot();
    act(() =>
      result.current.addDraftViewForRecordTableWidget('widget', task, {
        snapshot: preset,
        recordLimit: 5,
        presentationMode: 'OVERDUE_ATTENTION',
      }),
    );
    expect(store.get(draftAtom).widget).toEqual(preset);
    act(() => frames.splice(0).forEach((frame) => frame(0)));
    expect(
      store.get(layoutAtom).tabs[0].widgets[0].configuration,
    ).toMatchObject({
      configurationType: 'RECORD_TABLE',
      viewId: preset.view.id,
      recordLimit: 5,
      presentationMode: 'OVERDUE_ATTENTION',
    });
    await act(async () => result.current.saveRecordTableWidgetViews('layout'));
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    const input = mockUpsert.mock.calls[0][0].variables.input;
    expect(input.viewFilters).toEqual(
      preset.viewFilters.map(
        ({ viewId: _viewId, subFieldName: _subFieldName, ...filter }) => ({
          ...filter,
          subFieldName: undefined,
        }),
      ),
    );
    expect(input.viewFilterGroups).toEqual(
      preset.viewFilterGroups.map(
        ({ viewId: _viewId, parentViewFilterGroupId: _parent, ...group }) => ({
          ...group,
          parentViewFilterGroupId: undefined,
        }),
      ),
    );
    expect(input.viewSorts).toEqual(
      preset.viewSorts.map(({ viewId: _viewId, ...sort }) => sort),
    );
    expect(store.get(persistedAtom).widget).toEqual(
      store.get(draftAtom).widget,
    );
    // Reopening reads the same persisted native snapshot.
    store.set(draftAtom, store.get(persistedAtom));
    await act(async () => result.current.saveRecordTableWidgetViews('layout'));
    expect(mockUpsert).toHaveBeenCalledTimes(1);
  });

  it('normal source replacement resets filters/sorts/limit and supersedes a pending preset frame', () => {
    const { store, result } = setup();
    act(() => {
      result.current.addDraftViewForRecordTableWidget('widget', task, {
        snapshot: snapshot(),
        recordLimit: 5,
        presentationMode: 'OVERDUE_ATTENTION',
      });
      result.current.addDraftViewForRecordTableWidget(
        'widget',
        getMockObjectMetadataItemOrThrow('company'),
      );
      frames.splice(0).forEach((frame) => frame(0));
    });
    expect(store.get(draftAtom).widget.viewFilters).toEqual([]);
    expect(store.get(draftAtom).widget.viewSorts).toEqual([]);
    expect(
      store.get(layoutAtom).tabs[0].widgets[0].configuration,
    ).not.toHaveProperty('recordLimit');
    expect(
      store.get(layoutAtom).tabs[0].widgets[0].configuration,
    ).toMatchObject({ presentationMode: 'TABLE' });
  });

  it('does not resurrect a cancelled/deleted draft from a queued frame', () => {
    const { store, result } = setup();
    act(() => {
      result.current.addDraftViewForRecordTableWidget('widget', task, {
        snapshot: snapshot(),
        recordLimit: 5,
        presentationMode: 'OVERDUE_ATTENTION',
      });
      store.set(draftAtom, {});
      frames.splice(0).forEach((frame) => frame(0));
    });
    expect(store.get(draftAtom)).toEqual({});
    expect(
      store.get(layoutAtom).tabs[0].widgets[0].configuration,
    ).not.toHaveProperty('viewId');
  });
});
