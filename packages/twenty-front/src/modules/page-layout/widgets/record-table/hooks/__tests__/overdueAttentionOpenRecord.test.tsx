import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useOpenOverdueRecordInSidePanel } from '@/page-layout/widgets/record-table/hooks/useOpenOverdueRecordInSidePanel';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { ViewOpenRecordIn } from '~/generated-metadata/graphql';
import { buildOverdueTaskRecordTableWidgetPreset } from '@/page-layout/widgets/record-table/utils/buildOverdueTaskRecordTableWidgetPreset';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { AppPath, type ObjectPermissions } from 'twenty-shared/types';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';

const mockOpen = jest.fn();
const mockNavigate = jest.fn();
const mockClose = jest.fn();
let mockMobile = false;
jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => ({
    recordIndexId: 'attention-source',
    objectNameSingular: 'task',
  }),
}));
jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({ openRecordInSidePanel: mockOpen }),
}));
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockClose }),
}));
jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => mockNavigate,
}));
jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => mockMobile,
}));

describe('attention uses native open-record source context', () => {
  beforeEach(() => jest.clearAllMocks());
  it.each([false, true])(
    'preserves native filters/sorts and side-panel/mobile behavior (mobile=%s)',
    (mobile) => {
      mockMobile = mobile;
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
      const snapshot = buildOverdueTaskRecordTableWidgetPreset(task, {
        [task.id]: permission,
      })!;
      const store = createStore();
      const filters = mapViewFiltersToFilters(
        snapshot.viewFilters,
        task.fields,
      );
      const groups = mapViewFilterGroupsToRecordFilterGroups(
        snapshot.viewFilterGroups,
      );
      store.set(
        currentRecordFiltersComponentState.atomFamily({
          instanceId: 'attention-source',
        }),
        filters,
      );
      store.set(
        currentRecordFilterGroupsComponentState.atomFamily({
          instanceId: 'attention-source',
        }),
        groups,
      );
      store.set(
        currentRecordSortsComponentState.atomFamily({
          instanceId: 'attention-source',
        }),
        snapshot.viewSorts,
      );
      store.set(recordIndexOpenRecordInState.atom, ViewOpenRecordIn.SIDE_PANEL);
      const { result } = renderHook(() => useOpenRecordFromIndexView(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <Provider store={store}>{children}</Provider>
        ),
      });
      act(() =>
        result.current.openRecordFromIndexView({ recordId: 'task-id' }),
      );
      expect(
        store.get(
          contextStoreRecordShowParentViewComponentState.atomFamily({
            instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
        ),
      ).toMatchObject({
        parentViewComponentId: 'attention-source',
        parentViewObjectNameSingular: 'task',
        parentViewFilters: filters,
        parentViewSorts: snapshot.viewSorts,
        parentViewFilterGroups: groups,
      });
      if (mobile) {
        expect(mockNavigate).toHaveBeenCalledWith(AppPath.RecordShowPage, {
          objectNameSingular: 'task',
          objectRecordId: 'task-id',
        });
        expect(mockOpen).not.toHaveBeenCalled();
      } else {
        expect(mockOpen).toHaveBeenCalledWith({
          recordId: 'task-id',
          objectNameSingular: 'task',
          resetNavigationStack: true,
        });
        expect(mockNavigate).not.toHaveBeenCalled();
      }
    },
  );
  it.each([
    [false, ViewOpenRecordIn.SIDE_PANEL],
    [false, ViewOpenRecordIn.RECORD_PAGE],
    [true, ViewOpenRecordIn.SIDE_PANEL],
    [true, ViewOpenRecordIn.RECORD_PAGE],
  ])(
    'widget always uses side panel with native parent context (mobile=%s, preference=%s)',
    (mobile, preference) => {
      mockMobile = mobile;
      const store = createStore();
      store.set(recordIndexOpenRecordInState.atom, preference);
      const task = getMockObjectMetadataItemOrThrow('task');
      const snapshot = buildOverdueTaskRecordTableWidgetPreset(task, {
        [task.id]: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      })!;
      const filters = mapViewFiltersToFilters(
        snapshot.viewFilters,
        task.fields,
      );
      const groups = mapViewFilterGroupsToRecordFilterGroups(
        snapshot.viewFilterGroups,
      );
      store.set(
        currentRecordFiltersComponentState.atomFamily({
          instanceId: 'attention-source',
        }),
        filters,
      );
      store.set(
        currentRecordFilterGroupsComponentState.atomFamily({
          instanceId: 'attention-source',
        }),
        groups,
      );
      store.set(
        currentRecordSortsComponentState.atomFamily({
          instanceId: 'attention-source',
        }),
        snapshot.viewSorts,
      );
      const { result } = renderHook(() => useOpenOverdueRecordInSidePanel(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <Provider store={store}>{children}</Provider>
        ),
      });
      const recordId = '20202020-1234-4234-8234-123456789012';
      act(() => result.current.openOverdueRecordInSidePanel({ recordId }));
      expect(mockOpen).toHaveBeenCalledTimes(1);
      expect(mockOpen).toHaveBeenCalledWith({
        recordId,
        objectNameSingular: 'task',
        resetNavigationStack: true,
      });
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockClose).not.toHaveBeenCalled();
      expect(
        store.get(
          contextStoreRecordShowParentViewComponentState.atomFamily({
            instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
        ),
      ).toMatchObject({
        parentViewComponentId: 'attention-source',
        parentViewObjectNameSingular: 'task',
        parentViewFilters: filters,
        parentViewSorts: snapshot.viewSorts,
        parentViewFilterGroups: groups,
      });
    },
  );
});
