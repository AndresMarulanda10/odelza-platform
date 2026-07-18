import { act, renderHook } from '@testing-library/react';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ViewOpenRecordIn } from '~/generated-metadata/graphql';

const mockCreateOneRecord = jest.fn();
const mockStoreGet = jest.fn();
const mockBuildRecordInputFromRLSPredicates = jest.fn();
const mockBuildRecordInputFromFilters = jest.fn();

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({ createOneRecord: mockCreateOneRecord }),
}));

jest.mock('@/object-record/hooks/useBuildRecordInputFromRLSPredicates', () => ({
  useBuildRecordInputFromRLSPredicates: () => ({
    buildRecordInputFromRLSPredicates: mockBuildRecordInputFromRLSPredicates,
  }),
}));

jest.mock(
  '@/object-record/record-table/hooks/useBuildRecordInputFromFilters',
  () => ({
    useBuildRecordInputFromFilters: () => ({
      buildRecordInputFromFilters: mockBuildRecordInputFromFilters,
    }),
  }),
);

jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({ upsertRecordsInStore: jest.fn() }),
}));

jest.mock('@/object-record/utils/canOpenObjectInSidePanel', () => ({
  canOpenObjectInSidePanel: () => true,
}));

jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({ openRecordInSidePanel: jest.fn() }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState',
  () => ({ useAtomComponentFamilyStateCallbackState: () => jest.fn() }),
);

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue',
  () => ({ useAtomComponentSelectorValue: () => [] }),
);

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({ useAtomComponentStateValue: () => undefined }),
);

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useStore: () => ({ get: mockStoreGet, set: jest.fn() }),
}));

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => jest.fn(),
}));

const getObjectMetadataItem = (nameSingular: string) =>
  ({ nameSingular }) as EnrichedObjectMetadataItem;

describe('useCreateNewIndexRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreGet.mockReturnValue(ViewOpenRecordIn.SIDE_PANEL);
    mockCreateOneRecord.mockImplementation(async (recordInput) => recordInput);
    mockBuildRecordInputFromRLSPredicates.mockReturnValue({});
    mockBuildRecordInputFromFilters.mockReturnValue({});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('defaults a Task dueAt to 9 AM on the current local day', async () => {
    const now = new Date(2026, 6, 14, 17, 30);
    const expectedDueAt = new Date(now);

    expectedDueAt.setHours(9, 0, 0, 0);
    jest.useFakeTimers();
    jest.setSystemTime(now);

    const { result } = renderHook(() =>
      useCreateNewIndexRecord({
        objectMetadataItem: getObjectMetadataItem(CoreObjectNameSingular.Task),
      }),
    );

    await act(async () => {
      await result.current.createNewIndexRecord();
    });

    expect(mockCreateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({ dueAt: expectedDueAt.toISOString() }),
    );
  });

  it('preserves an explicit Task dueAt', async () => {
    const explicitDueAt = '2026-07-20T15:00:00.000Z';

    mockBuildRecordInputFromRLSPredicates.mockReturnValue({
      dueAt: '2026-07-18T15:00:00.000Z',
    });
    mockBuildRecordInputFromFilters.mockReturnValue({
      dueAt: '2026-07-19T15:00:00.000Z',
    });

    const { result } = renderHook(() =>
      useCreateNewIndexRecord({
        objectMetadataItem: getObjectMetadataItem(CoreObjectNameSingular.Task),
      }),
    );

    await act(async () => {
      await result.current.createNewIndexRecord({ dueAt: explicitDueAt });
    });

    expect(mockCreateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({ dueAt: explicitDueAt }),
    );
  });

  it('preserves a filter-derived Task dueAt over RLS predicates', async () => {
    const filterDueAt = '2026-07-20T15:00:00.000Z';

    mockBuildRecordInputFromRLSPredicates.mockReturnValue({
      dueAt: '2026-07-19T15:00:00.000Z',
    });
    mockBuildRecordInputFromFilters.mockReturnValue({ dueAt: filterDueAt });

    const { result } = renderHook(() =>
      useCreateNewIndexRecord({
        objectMetadataItem: getObjectMetadataItem(CoreObjectNameSingular.Task),
      }),
    );

    await act(async () => {
      await result.current.createNewIndexRecord();
    });

    expect(mockCreateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({ dueAt: filterDueAt }),
    );
  });

  it('preserves an RLS-derived Task dueAt over the default', async () => {
    const rlsDueAt = '2026-07-20T15:00:00.000Z';

    mockBuildRecordInputFromRLSPredicates.mockReturnValue({ dueAt: rlsDueAt });

    const { result } = renderHook(() =>
      useCreateNewIndexRecord({
        objectMetadataItem: getObjectMetadataItem(CoreObjectNameSingular.Task),
      }),
    );

    await act(async () => {
      await result.current.createNewIndexRecord();
    });

    expect(mockCreateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({ dueAt: rlsDueAt }),
    );
  });

  it('does not add dueAt to non-Task records', async () => {
    const { result } = renderHook(() =>
      useCreateNewIndexRecord({
        objectMetadataItem: getObjectMetadataItem(
          CoreObjectNameSingular.Company,
        ),
      }),
    );

    await act(async () => {
      await result.current.createNewIndexRecord();
    });

    expect(mockCreateOneRecord).toHaveBeenCalledWith(
      expect.not.objectContaining({ dueAt: expect.anything() }),
    );
  });
});
