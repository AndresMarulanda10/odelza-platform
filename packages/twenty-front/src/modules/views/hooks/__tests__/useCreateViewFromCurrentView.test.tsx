import { act, renderHook } from '@testing-library/react';
import { useCreateViewFromCurrentView } from '@/views/hooks/useCreateViewFromCurrentView';
import { ViewType } from '@/views/types/ViewType';

const create = jest.fn();
const persistFields = jest.fn();
const persistSorts = jest.fn();
const persistFilters = jest.fn();
const persistGroups = jest.fn();
let sourceView: Record<string, unknown>;
const fields = [
  {
    id: 'start',
    universalIdentifier: 'start-universal',
    name: 'startDate',
    type: 'DATE',
    isActive: true,
  },
  {
    id: 'end',
    universalIdentifier: 'end-universal',
    name: 'endDate',
    type: 'DATE',
    isActive: true,
  },
];
const objectMetadataItem = {
  id: 'tasks',
  nameSingular: 'task',
  isActive: true,
  fields,
  readableFields: fields,
};
jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useStore: () => ({
    get: jest
      .fn()
      .mockReturnValueOnce('current')
      .mockImplementation(() => sourceView),
  }),
}));
jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => ({
    objectMetadataItem,
    recordIndexId: 'scoped',
  }),
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState',
  () => ({ useAtomComponentStateCallbackState: jest.fn() }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({ useAtomComponentStateValue: () => [] }),
);
jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({ objectPermissionsByObjectMetadataId: {} }),
}));
jest.mock('@/views/hooks/internal/usePerformViewAPIPersist', () => ({
  usePerformViewAPIPersist: () => ({ performViewAPICreate: create }),
}));
jest.mock('@/views/hooks/internal/usePerformViewFieldAPIPersist', () => ({
  usePerformViewFieldAPIPersist: () => ({
    performViewFieldAPICreate: persistFields,
  }),
}));
jest.mock('@/views/hooks/internal/usePerformViewSortAPIPersist', () => ({
  usePerformViewSortAPIPersist: () => ({
    performViewSortAPICreate: persistSorts,
  }),
}));
jest.mock('@/views/hooks/internal/usePerformViewFilterAPIPersist', () => ({
  usePerformViewFilterAPIPersist: () => ({
    performViewFilterAPICreate: persistFilters,
  }),
}));
jest.mock('@/views/hooks/internal/usePerformViewFilterGroupAPIPersist', () => ({
  usePerformViewFilterGroupAPIPersist: () => ({
    performViewFilterGroupAPICreate: persistGroups,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  sourceView = {
    id: 'current',
    objectMetadataId: 'tasks',
    type: ViewType.TABLE,
    name: 'Tasks',
    icon: 'IconTable',
    viewFields: [],
    mainGroupByFieldMetadataId: 'old-group',
  };
  create.mockResolvedValue({
    status: 'successful',
    response: { data: { createView: { id: 'new-view' } } },
  });
  persistFields.mockResolvedValue({ status: 'successful' });
  persistFilters.mockResolvedValue({ status: 'successful' });
  persistSorts.mockResolvedValue({ status: 'successful' });
  persistGroups.mockResolvedValue({ status: 'successful' });
});

it('creates Timeline with readable universal date defaults and no inherited group', async () => {
  const { result } = renderHook(() => useCreateViewFromCurrentView());
  await act(async () => {
    await result.current.createViewFromCurrentView(
      { type: ViewType.TIMELINE },
      true,
    );
  });
  expect(create.mock.calls[0][0].input).toMatchObject({
    type: ViewType.TIMELINE,
    mainGroupByFieldMetadataId: null,
    timelineConfiguration: {
      startDateFieldMetadataUniversalIdentifier: 'start-universal',
      endDateFieldMetadataUniversalIdentifier: 'end-universal',
    },
  });
  expect(persistGroups).toHaveBeenCalled();
  expect(persistFilters).toHaveBeenCalled();
  expect(persistSorts).toHaveBeenCalled();
});

it('duplicates existing custom Timeline configuration without GraphQL typenames', async () => {
  sourceView.timelineConfiguration = {
    __typename: 'ViewTimelineConfiguration',
    startDateFieldMetadataUniversalIdentifier: 'custom-start',
    endDateFieldMetadataUniversalIdentifier: 'custom-end',
    barColor: '#123456',
  };
  sourceView.type = ViewType.TIMELINE;
  const { result } = renderHook(() => useCreateViewFromCurrentView());
  await act(async () => {
    await result.current.createViewFromCurrentView(
      { type: ViewType.TIMELINE },
      true,
    );
  });
  expect(create.mock.calls[0][0].input.timelineConfiguration).toEqual({
    startDateFieldMetadataUniversalIdentifier: 'custom-start',
    endDateFieldMetadataUniversalIdentifier: 'custom-end',
    barColor: '#123456',
  });
});

it('preserves ordinary Table creation', async () => {
  const { result } = renderHook(() => useCreateViewFromCurrentView());
  await act(async () => {
    await result.current.createViewFromCurrentView(
      { type: ViewType.TABLE, name: 'New table' },
      false,
    );
  });
  expect(create.mock.calls[0][0].input).toMatchObject({
    type: ViewType.TABLE,
    name: 'New table',
  });
  expect(persistFilters).not.toHaveBeenCalled();
});
