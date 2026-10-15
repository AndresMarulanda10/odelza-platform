import { MockedProvider } from '@apollo/client/testing/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { print } from 'graphql';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';

import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { RecordTableWidgetProvider } from '@/object-record/record-table-widget/components/RecordTableWidgetProvider';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { OverdueAttentionViewGate } from '@/page-layout/widgets/record-table/components/OverdueAttentionViewGate';
import { buildOverdueTaskRecordTableWidgetPreset } from '@/page-layout/widgets/record-table/utils/buildOverdueTaskRecordTableWidgetPreset';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/side-panel/pages/record-page/states/viewableRecordNameSingularComponentState';
import { UserContext } from '@/users/contexts/UserContext';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { SidePanelPages } from 'twenty-shared/types';
import { ViewOpenRecordIn } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const mockNavigateSidePanel = jest.fn();
const mockNavigateApp = jest.fn();
jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => mockNavigateApp,
}));
jest.mock('@/side-panel/hooks/useNavigateSidePanel', () => ({
  useNavigateSidePanel: () => ({ navigateSidePanel: mockNavigateSidePanel }),
}));

const records = Array.from({ length: 7 }, (_, index) => ({
  __typename: 'Task',
  id: `20202020-1234-4234-8234-${String(index + 1).padStart(12, '0')}`,
  title: `Provider task ${index + 1}`,
  dueAt: '2020-01-01T00:00:00Z',
  status: 'TODO',
  assignee: null,
}));
const mockFind = jest.fn();
const mockMore = jest.fn();
const mockWidgetQuery = jest.fn();
const mockPaginationQuery = jest.fn();
let mockDeleted = false;
jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (options: { objectNameSingular: string }) => {
    mockPaginationQuery(options, nativeDocument(options));
    return {
      loading: false,
      records: [
        {
          id: 'current',
          position: 1,
          dueAt: records[0].dueAt,
          deletedAt: mockDeleted ? '2020-01-02T00:00:00Z' : null,
        },
      ],
      totalCount: 1,
    };
  },
}));
jest.mock('@/object-record/hooks/useLazyFindManyRecords', () => ({
  useLazyFindManyRecords: (
    params: Parameters<typeof getQueryIdentifier>[0],
  ) => {
    mockWidgetQuery(params, nativeDocument(params));
    return {
      queryIdentifier: getQueryIdentifier(params),
      findManyRecordsLazy: mockFind,
      fetchMoreRecordsLazy: mockMore,
    };
  },
}));

const task = getMockObjectMetadataItemOrThrow('task');
const permission = {
  objectMetadataId: task.id,
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const nativeDocument = (params: Parameters<typeof getQueryIdentifier>[0]) =>
  print(
    generateFindManyRecordsQuery({
      ...params,
      objectMetadataItem: getMockObjectMetadataItemOrThrow(
        params.objectNameSingular,
      ),
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      objectPermissionsByObjectMetadataId: {
        [task.id]: permission,
        [getMockObjectMetadataItemOrThrow('dashboard').id]: {
          ...permission,
          objectMetadataId: getMockObjectMetadataItemOrThrow('dashboard').id,
        },
      },
    }),
  );

const SourceIdentity = () => {
  const source = useRecordIndexContextOrThrow();
  return (
    <output data-testid="source-identity">
      {JSON.stringify({
        objectNameSingular: source.objectNameSingular,
        recordIndexId: source.recordIndexId,
        viewBarInstanceId: source.viewBarInstanceId,
        recordLimit: source.recordLimit,
      })}
    </output>
  );
};

const PaginationConsumers = () => {
  useRecordShowPagePagination('dashboard', 'current');
  const taskPagination = useRecordShowPagePagination('task', records[0].id);
  return (
    <button onClick={taskPagination.navigateToNextRecord}>
      Next native task
    </button>
  );
};

const expectIsolatedPagination = (hasTaskParent: boolean) => {
  for (const [options, document] of mockPaginationQuery.mock.calls) {
    if (options.objectNameSingular === 'dashboard') {
      expect(JSON.stringify(options)).not.toMatch(/dueAt|status/);
      expect(document).toContain('DashboardFilterInput');
      expect(document).not.toMatch(/dueAt|status/);
    }
  }
  if (hasTaskParent) {
    expect(
      mockPaginationQuery.mock.calls.some(
        ([options]) =>
          options.objectNameSingular === 'task' &&
          JSON.stringify(options.filter).includes('dueAt') &&
          JSON.stringify(options.filter).includes('status'),
      ),
    ).toBe(true);
  }
  for (const [options, document] of mockWidgetQuery.mock.calls) {
    expect(JSON.stringify(options.filter)).toMatch(/dueAt/);
    expect(JSON.stringify(options.filter)).toMatch(/status/);
    expect(document).toContain('TaskFilterInput');
    expect(document).toContain('dueAt');
  }
};

const renderNativeProvider = async () => {
  const store = createStore();
  setTestObjectMetadataItemsInMetadataStore(
    store,
    getTestEnrichedObjectMetadataItemsMock(),
  );
  store.set(currentUserWorkspaceState.atom, {
    permissionFlags: [],
    twoFactorAuthenticationMethodSummary: null,
    objectsPermissions: [
      permission,
      {
        ...permission,
        objectMetadataId:
          getMockObjectMetadataItemOrThrow('workspaceMember').id,
      },
    ],
  });
  const snapshot = buildOverdueTaskRecordTableWidgetPreset(task, {
    [task.id]: permission,
  })!;
  const widgetId = 'attention-provider-widget';
  const layoutId = 'attention-provider-layout';
  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    task.namePlural,
    snapshot.view.id,
  );
  store.set(
    recordTableWidgetViewDraftComponentState.atomFamily({
      instanceId: layoutId,
    }),
    { [widgetId]: snapshot },
  );
  store.set(recordIndexOpenRecordInState.atom, ViewOpenRecordIn.RECORD_PAGE);

  render(
    <Provider store={store}>
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <MockedProvider mocks={[]}>
          <UserContext.Provider
            value={{
              dateFormat: DateFormat.MONTH_FIRST,
              timeFormat: TimeFormat.HOUR_24,
              timeZone: 'UTC',
            }}
          >
            <PaginationConsumers />
            <PageLayoutComponentInstanceContext.Provider
              value={{ instanceId: layoutId }}
            >
              <PageLayoutEditModeProviderContext value={{ isInEditMode: true }}>
                <RecordTableWidgetProvider
                  objectNameSingular={task.nameSingular}
                  viewId={snapshot.view.id}
                  widgetId={widgetId}
                  recordLimit={5}
                >
                  <SourceIdentity />
                  <OverdueAttentionViewGate viewId={snapshot.view.id} />
                </RecordTableWidgetProvider>
              </PageLayoutEditModeProviderContext>
            </PageLayoutComponentInstanceContext.Provider>
          </UserContext.Provider>
        </MockedProvider>
      </MemoryRouter>
    </Provider>,
  );
  expectIsolatedPagination(false);
  await screen.findByRole('button', { name: records[0].title });
  expectIsolatedPagination(false);
  const filters = mapViewFiltersToFilters(snapshot.viewFilters, task.fields);
  const groups = mapViewFilterGroupsToRecordFilterGroups(
    snapshot.viewFilterGroups,
  );
  await waitFor(() =>
    expect(
      store.get(
        currentRecordFiltersComponentState.atomFamily({
          instanceId: recordIndexId,
        }),
      ),
    ).toEqual(filters),
  );
  expect(
    store.get(
      currentRecordFilterGroupsComponentState.atomFamily({
        instanceId: recordIndexId,
      }),
    ),
  ).toEqual(groups);
  expect(
    store.get(
      currentRecordSortsComponentState.atomFamily({
        instanceId: recordIndexId,
      }),
    ),
  ).toEqual(snapshot.viewSorts);
  expect(
    JSON.parse(screen.getByTestId('source-identity').textContent!),
  ).toEqual({
    objectNameSingular: task.nameSingular,
    recordIndexId,
    viewBarInstanceId: recordIndexId,
    recordLimit: 5,
  });
  return { store, recordIndexId, filters, groups, sorts: snapshot.viewSorts };
};

describe('attention native provider → list → explicit side-panel state integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleted = false;
    mockFind.mockResolvedValue({
      data: {},
      records: records.slice(0, 5),
      totalCount: 7,
      hasNextPage: true,
    });
    mockMore.mockResolvedValue({
      data: { pageInfo: { hasNextPage: false } },
      records: records.slice(5),
      totalCount: 7,
    });
  });

  it('keeps known deleted Dashboard neighbors without a named parent', async () => {
    mockDeleted = true;
    await renderNativeProvider();
    const neighbors = mockPaginationQuery.mock.calls
      .map(([options]) => options)
      .filter(
        (options) =>
          options.objectNameSingular === 'dashboard' &&
          !options.recordGqlFields.deletedAt,
      );
    expect(neighbors.length).toBeGreaterThan(0);
    for (const options of neighbors) {
      expect(options.withSoftDeleted).toBe(true);
      expect(JSON.stringify(options.filter)).toContain('deletedAt');
    }
  });

  it.each(['pointer', 'Enter', 'Space'] as const)(
    'uses the actual widget provider and native view-loaded state for one %s activation',
    async (activation) => {
      const source = await renderNativeProvider();
      const button = screen.getByRole('button', { name: records[0].title });
      const row = button.closest('li')!;
      expect(row.querySelectorAll('button')).toHaveLength(1);
      expect(button.childElementCount).toBe(0);
      expect(row).toHaveTextContent('Unassigned');
      expect(row.querySelector('[aria-label$="days overdue"]')).not.toBeNull();
      const user = userEvent.setup();
      if (activation === 'pointer') await user.click(button);
      else {
        button.focus();
        await user.keyboard(activation === 'Enter' ? '{Enter}' : ' ');
      }

      expect(mockNavigateSidePanel).toHaveBeenCalledTimes(1);
      expectIsolatedPagination(true);
      fireEvent.click(screen.getByRole('button', { name: 'Next native task' }));
      expect(mockNavigateApp).toHaveBeenCalledWith(
        expect.anything(),
        { objectNameSingular: 'task', objectRecordId: 'current' },
        { viewId: null },
      );
      const navigation = mockNavigateSidePanel.mock.calls[0][0];
      expect(navigation).toMatchObject({
        page: SidePanelPages.ViewRecord,
        resetNavigationStack: true,
      });
      expect(
        source.store.get(
          viewableRecordIdComponentState.atomFamily({
            instanceId: navigation.pageId,
          }),
        ),
      ).toBe(records[0].id);
      expect(
        source.store.get(
          viewableRecordNameSingularComponentState.atomFamily({
            instanceId: navigation.pageId,
          }),
        ),
      ).toBe(task.nameSingular);
      expect(
        source.store.get(
          contextStoreRecordShowParentViewComponentState.atomFamily({
            instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
        ),
      ).toEqual({
        parentViewComponentId: source.recordIndexId,
        parentViewObjectNameSingular: task.nameSingular,
        parentViewFilters: source.filters,
        parentViewFilterGroups: source.groups,
        parentViewSorts: source.sorts,
      });
      expect(source.store.get(recordIndexOpenRecordInState.atom)).toBe(
        ViewOpenRecordIn.RECORD_PAGE,
      );

      fireEvent.click(screen.getByRole('button', { name: 'View all' }));
      await screen.findByRole('button', { name: records[6].title });
      fireEvent.click(screen.getByRole('button', { name: 'Show less' }));
      expect(mockMore).toHaveBeenCalledTimes(1);
      expect(mockNavigateSidePanel).toHaveBeenCalledTimes(1);
    },
  );
});
