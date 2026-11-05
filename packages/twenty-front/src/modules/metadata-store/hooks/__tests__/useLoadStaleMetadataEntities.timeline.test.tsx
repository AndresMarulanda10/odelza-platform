import { act, renderHook } from '@testing-library/react';
import { useLoadStaleMetadataEntities } from '@/metadata-store/hooks/useLoadStaleMetadataEntities';
import { ViewType } from '~/generated-metadata/graphql';

const mockQuery = jest.fn();
const mockReplaceDraft = jest.fn();
const mockApplyChanges = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ query: mockQuery }),
}));
jest.mock('@/metadata-store/hooks/useUpdateMetadataStoreDraft', () => ({
  useUpdateMetadataStoreDraft: () => ({
    replaceDraft: mockReplaceDraft,
    applyChanges: mockApplyChanges,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockImplementation(async ({ variables }) => ({
    data: {
      getViews: variables.viewTypes.map((type: ViewType) => ({
        id: `saved-${type}`,
        type,
        ...(type === ViewType.TIMELINE
          ? {
              timelineConfiguration: { barColor: '#123456' },
              viewFields: [{ id: 'timeline-field' }],
            }
          : {}),
      })),
    },
  }));
});

it('hydrates saved Timeline settings and related fields after a fresh metadata load', async () => {
  const { result } = renderHook(() => useLoadStaleMetadataEntities());
  await act(async () => result.current.loadStaleMetadataEntities(['views']));
  expect(mockReplaceDraft).toHaveBeenCalledWith(
    'views',
    expect.arrayContaining([
      expect.objectContaining({
        id: 'saved-TIMELINE',
        type: ViewType.TIMELINE,
        timelineConfiguration: { barColor: '#123456' },
      }),
    ]),
  );
  expect(mockReplaceDraft).toHaveBeenCalledWith('viewFields', [
    { id: 'timeline-field', viewId: 'saved-TIMELINE' },
  ]);
  expect(mockApplyChanges).toHaveBeenCalledTimes(1);
});

it('preserves existing index and widget view hydration and skips up-to-date metadata', async () => {
  const { result } = renderHook(() => useLoadStaleMetadataEntities());
  await act(async () => result.current.loadStaleMetadataEntities([]));
  expect(mockQuery).not.toHaveBeenCalled();
  expect(mockApplyChanges).not.toHaveBeenCalled();
  await act(async () => result.current.loadStaleMetadataEntities(['views']));
  expect(mockQuery).toHaveBeenCalledTimes(3);
  for (const type of [
    ViewType.TABLE,
    ViewType.KANBAN,
    ViewType.CALENDAR,
    ViewType.FIELDS_WIDGET,
    ViewType.TABLE_WIDGET,
  ]) {
    expect(mockReplaceDraft).toHaveBeenCalledWith(
      'views',
      expect.arrayContaining([{ id: `saved-${type}`, type }]),
    );
  }
  expect(mockQuery.mock.calls[1][0].variables.viewTypes).toEqual([
    ViewType.FIELDS_WIDGET,
  ]);
  expect(mockQuery.mock.calls[2][0].variables.viewTypes).toEqual([
    ViewType.TABLE_WIDGET,
  ]);
});
