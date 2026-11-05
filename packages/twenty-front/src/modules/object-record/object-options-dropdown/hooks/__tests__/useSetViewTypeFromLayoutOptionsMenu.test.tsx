import { act, renderHook } from '@testing-library/react';
import { useSetViewTypeFromLayoutOptionsMenu } from '@/object-record/object-options-dropdown/hooks/useSetViewTypeFromLayoutOptionsMenu';
import { ViewType } from '@/views/types/ViewType';

const updateCurrentView = jest.fn();
const setType = jest.fn();
let currentView: Record<string, unknown>;
const fields = [
  {
    id: 'start',
    name: 'startDate',
    universalIdentifier: 'start-universal',
    type: 'DATE',
    isActive: true,
  },
  {
    id: 'end',
    name: 'endDate',
    universalIdentifier: 'end-universal',
    type: 'DATE',
    isActive: true,
  },
];
jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useStore: () => ({
    get: jest
      .fn()
      .mockReturnValueOnce('current')
      .mockImplementation(() => [currentView]),
  }),
}));
jest.mock('@/views/hooks/useUpdateCurrentView', () => ({
  useUpdateCurrentView: () => ({ updateCurrentView }),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomState', () => ({
  useSetAtomState: () => setType,
}));
jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => ({
    objectMetadataItem: {
      id: 'tasks',
      nameSingular: 'task',
      fields,
      readableFields: fields,
    },
  }),
}));
jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({ objectPermissionsByObjectMetadataId: {} }),
}));
jest.mock(
  '@/object-record/record-index/hooks/useLoadRecordIndexStates',
  () => ({
    useLoadRecordIndexStates: () => ({ loadRecordIndexStates: jest.fn() }),
  }),
);
jest.mock('@/views/view-picker/hooks/useGetAvailableFieldsForCalendar', () => ({
  useGetAvailableFieldsForCalendar: () => ({
    availableFieldsForCalendar: fields,
  }),
}));
jest.mock(
  '@/views/view-picker/hooks/useGetAvailableFieldsToGroupRecordsBy',
  () => ({
    useGetAvailableFieldsToGroupRecordsBy: () => ({
      availableFieldsForGrouping: [],
    }),
  }),
);

beforeEach(() => {
  jest.clearAllMocks();
  currentView = { id: 'current', type: ViewType.TABLE, icon: 'IconTable' };
});

it('switches Tasks to Timeline with readable date defaults and clears grouping', async () => {
  const { result } = renderHook(() => useSetViewTypeFromLayoutOptionsMenu());
  await act(async () => {
    await result.current.setAndPersistViewType(ViewType.TIMELINE);
  });
  expect(updateCurrentView).toHaveBeenCalledWith(
    expect.objectContaining({
      type: ViewType.TIMELINE,
      mainGroupByFieldMetadataId: null,
      timelineConfiguration: expect.objectContaining({
        startDateFieldMetadataUniversalIdentifier: 'start-universal',
        endDateFieldMetadataUniversalIdentifier: 'end-universal',
      }),
    }),
  );
  expect(setType).toHaveBeenCalledWith(ViewType.TIMELINE);
});

it('retains custom configuration on return to Timeline', async () => {
  currentView.timelineConfiguration = {
    startDateFieldMetadataUniversalIdentifier: 'custom-start',
    endDateFieldMetadataUniversalIdentifier: 'custom-end',
    barColor: '#123456',
  };
  const { result } = renderHook(() => useSetViewTypeFromLayoutOptionsMenu());
  await act(async () => {
    await result.current.setAndPersistViewType(ViewType.TIMELINE);
  });
  expect(updateCurrentView).toHaveBeenCalledWith(
    expect.objectContaining({
      timelineConfiguration: currentView.timelineConfiguration,
    }),
  );
});

it('preserves switching to Table without overwriting saved Timeline settings', async () => {
  const { result } = renderHook(() => useSetViewTypeFromLayoutOptionsMenu());
  await act(async () => {
    await result.current.setAndPersistViewType(ViewType.TABLE);
  });
  expect(updateCurrentView).toHaveBeenCalledWith({
    type: ViewType.TABLE,
    mainGroupByFieldMetadataId: null,
  });
});

it('retains the default index restriction for Timeline', async () => {
  currentView.key = 'INDEX';
  const { result } = renderHook(() => useSetViewTypeFromLayoutOptionsMenu());
  await act(async () => {
    await result.current.setAndPersistViewType(ViewType.TIMELINE);
  });
  expect(updateCurrentView).not.toHaveBeenCalled();
  expect(setType).not.toHaveBeenCalled();
});
