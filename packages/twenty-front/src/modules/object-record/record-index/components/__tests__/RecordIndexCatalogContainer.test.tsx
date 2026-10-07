import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordIndexCatalogContainer } from '@/object-record/record-index/components/RecordIndexCatalogContainer';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewType } from '@/views/types/ViewType';
import { RecordIndexContainer } from '@/object-record/record-index/components/RecordIndexContainer';
import { useHasCurrentViewNonReadableFields } from '@/object-record/record-index/hooks/useHasCurrentViewNonReadableFields';

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ViewType.CATALOG,
}));
jest.mock(
  '@/object-record/record-index/hooks/useHasCurrentViewNonReadableFields',
  () => ({
    useHasCurrentViewNonReadableFields: jest.fn(),
  }),
);
jest.mock(
  '@/object-record/record-index/components/RecordIndexEmptyStateNotShared',
  () => ({
    RecordIndexEmptyStateNotShared: () => <div>Permission denied</div>,
  }),
);
jest.mock(
  '@/object-record/record-index/components/RecordIndexFiltersToContextStoreEffect',
  () => ({
    RecordIndexFiltersToContextStoreEffect: () => null,
  }),
);
jest.mock(
  '@/object-record/record-index/components/RecordIndexTableContainer',
  () => ({
    RecordIndexTableContainer: () => null,
  }),
);
jest.mock(
  '@/object-record/record-index/components/RecordIndexCalendarContainer',
  () => ({
    RecordIndexCalendarContainer: () => null,
  }),
);
jest.mock(
  '@/object-record/record-board/components/RecordBoardContainer',
  () => ({
    RecordBoardContainer: () => null,
  }),
);

jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: jest.fn(),
}));
jest.mock(
  '@/object-record/record-index/hooks/useOpenRecordFromIndexView',
  () => ({
    useOpenRecordFromIndexView: jest.fn(),
  }),
);
jest.mock(
  '@/object-record/record-index/hooks/useRecordIndexTableQuery',
  () => ({
    useRecordIndexTableQuery: jest.fn(),
  }),
);
jest.mock('@/views/hooks/useGetCurrentViewOnly', () => ({
  useGetCurrentViewOnly: jest.fn(),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue', () => ({
  useAtomFamilyStateValue: jest.fn(() => false),
}));
jest.mock(
  '@/object-record/record-index/hooks/useMigrateCatalogViewFields',
  () => ({
    useMigrateCatalogViewFields: jest.fn(),
  }),
);

const renderCatalog = ({
  fields,
  currentView,
  records,
  query = {},
}: {
  fields: { id: string; name: string }[];
  currentView: Record<string, unknown>;
  records: Record<string, unknown>[];
  query?: Record<string, unknown>;
}) => {
  (useRecordIndexContextOrThrow as jest.Mock).mockReturnValue({
    objectNameSingular: 'example',
    objectMetadataItem: { fields },
    labelIdentifierFieldMetadataItem: fields[0],
  });
  (useGetCurrentViewOnly as jest.Mock).mockReturnValue({ currentView });
  (useOpenRecordFromIndexView as jest.Mock).mockReturnValue({
    openRecordFromIndexView: jest.fn(),
  });
  (useRecordIndexTableQuery as jest.Mock).mockReturnValue({
    records: records.map((record) => ({ id: 'record-id', ...record })),
    loading: false,
    hasNextPage: false,
    fetchMoreRecords: jest.fn(),
    refetch: jest.fn(),
    queryIdentifier: 'catalog-query',
    ...query,
  });

  return render(<RecordIndexCatalogContainer />);
};

describe('RecordIndexCatalogContainer', () => {
  it('shows recovered records and removes pagination after the final page', async () => {
    const refetch = jest.fn().mockResolvedValue({});
    const { rerender } = renderCatalog({
      fields: [{ id: 'name-id', name: 'name' }],
      currentView: { type: ViewType.CATALOG, viewFields: [] },
      records: [],
      query: { error: new Error('Query failed'), refetch },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(1));
    (useRecordIndexTableQuery as jest.Mock).mockReturnValue({
      records: [{ id: 'one', name: 'Recovered card' }],
      loading: false,
      hasNextPage: false,
      queryIdentifier: 'catalog-query',
    });
    rerender(<RecordIndexCatalogContainer />);
    expect(screen.getByText('Recovered card')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Load more' }),
    ).not.toBeInTheDocument();
  });

  const renderState = (query: Record<string, unknown> = {}) =>
    renderCatalog({
      fields: [{ id: 'name-id', name: 'name' }],
      currentView: { type: ViewType.CATALOG, viewFields: [] },
      records: [],
      query,
    });

  it('does not mount the Catalog query when parent filter/sort read permission is denied', () => {
    (useRecordIndexContextOrThrow as jest.Mock).mockReturnValue({
      objectMetadataItem: { fields: [] },
    });
    (useHasCurrentViewNonReadableFields as jest.Mock).mockReturnValue({
      hasCurrentViewNonReadableFields: true,
    });
    (useRecordIndexTableQuery as jest.Mock).mockClear();
    render(<RecordIndexContainer />);
    expect(screen.getByText('Permission denied')).toBeInTheDocument();
    expect(useRecordIndexTableQuery).not.toHaveBeenCalled();
    expect(screen.queryByText('No records to display')).not.toBeInTheDocument();
  });

  it('allows readable records through the parent for an update-denied object', () => {
    const { unmount } = renderState({
      records: [{ id: 'one', name: 'Read-only card' }],
    });
    unmount();
    (useRecordIndexContextOrThrow as jest.Mock).mockReturnValue({
      objectNameSingular: 'example',
      objectMetadataItem: {
        id: 'example-id',
        fields: [{ id: 'name-id', name: 'name' }],
      },
      labelIdentifierFieldMetadataItem: { id: 'name-id', name: 'name' },
      objectPermissionsByObjectMetadataId: {
        'example-id': {
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
        },
      },
    });
    (useHasCurrentViewNonReadableFields as jest.Mock).mockReturnValue({
      hasCurrentViewNonReadableFields: false,
    });
    render(<RecordIndexContainer />);
    expect(screen.getByText('Read-only card')).toBeInTheDocument();
    expect(screen.queryByText('Permission denied')).not.toBeInTheDocument();
  });

  it('distinguishes initial loading from successful empty results', () => {
    const { rerender } = renderState({ loading: true });
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByText('No records to display')).not.toBeInTheDocument();
    (useRecordIndexTableQuery as jest.Mock).mockReturnValue({
      records: [],
      loading: false,
      queryIdentifier: 'catalog-query',
    });
    rerender(<RecordIndexCatalogContainer />);
    expect(screen.getByText('No records to display')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('retries a failed query, contains rejection, and prevents concurrent retries', async () => {
    let rejectRequest!: (error: Error) => void;
    const refetch = jest.fn(
      () =>
        new Promise((_, reject) => {
          rejectRequest = reject;
        }),
    );
    renderState({ error: new Error('Query failed'), refetch });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load records',
    );
    expect(screen.queryByText('No records to display')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
    await act(async () => rejectRequest(new Error('Retry failed')));
    expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled();
  });

  it.each(['returned', 'rejected'])(
    'preserves cards and retries %s pagination errors',
    async (failure) => {
      let finish!: (value: { error?: Error }) => void;
      const fetchMoreRecords = jest.fn().mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      );
      if (failure === 'returned') {
        fetchMoreRecords.mockResolvedValueOnce({
          error: new Error('Page failed'),
        });
      } else {
        fetchMoreRecords.mockRejectedValueOnce(new Error('Page failed'));
      }
      fetchMoreRecords.mockResolvedValueOnce({});
      const refetch = jest.fn();
      renderState({
        records: [{ id: 'one', name: 'Existing card' }],
        hasNextPage: true,
        fetchMoreRecords,
        refetch,
      });
      const button = screen.getByRole('button', { name: 'Load more' });
      fireEvent.click(button);
      fireEvent.click(button);
      expect(fetchMoreRecords).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Existing card')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Loading' })).toBeDisabled();
      await act(async () => finish({}));
      fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
      await waitFor(() =>
        expect(screen.getByRole('alert')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
      await waitFor(() =>
        expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
      );
      expect(fetchMoreRecords).toHaveBeenCalledTimes(3);
      expect(refetch).not.toHaveBeenCalled();
      expect(screen.getByText('Existing card')).toBeInTheDocument();
    },
  );

  it('honors shared pagination fetching state and keeps cached cards while loading', () => {
    (useAtomFamilyStateValue as jest.Mock).mockReturnValue(true);
    const fetchMoreRecords = jest.fn();
    renderState({
      records: [{ id: 'one', name: 'Cached card' }],
      loading: true,
      hasNextPage: true,
      fetchMoreRecords,
    });
    expect(screen.getByText('Cached card')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Loading' }));
    expect(fetchMoreRecords).not.toHaveBeenCalled();
    (useAtomFamilyStateValue as jest.Mock).mockReturnValue(false);
  });

  it('does not carry pagination errors into a different query', async () => {
    const { rerender } = renderState({
      records: [{ id: 'one', name: 'Old card' }],
      hasNextPage: true,
      fetchMoreRecords: jest
        .fn()
        .mockResolvedValue({ error: new Error('Page failed') }),
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    (useRecordIndexTableQuery as jest.Mock).mockReturnValue({
      records: [],
      loading: false,
      queryIdentifier: 'new-query',
    });
    rerender(<RecordIndexCatalogContainer />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('No records to display')).toBeInTheDocument();
  });

  it('uses the persisted compact setting when rendering Catalog cards', () => {
    const fields = [
      { id: 'name-id', name: 'name' },
      { id: 'subtitle-id', name: 'subtitle' },
      { id: 'detail-id', name: 'detail' },
    ];

    renderCatalog({
      fields,
      currentView: {
        type: ViewType.CATALOG,
        isCompact: true,
        viewFields: [
          { fieldMetadataId: 'subtitle-id', position: 0, isVisible: true },
          { fieldMetadataId: 'detail-id', position: 1, isVisible: true },
        ],
      },
      records: [
        {
          name: 'Catalog record title',
          subtitle: 'Catalog subtitle',
          detail: 'Catalog detail',
        },
      ],
    });

    expect(screen.getByText('Catalog record title')).toBeInTheDocument();
    expect(screen.queryByText('Catalog subtitle')).not.toBeInTheDocument();
    expect(screen.queryByText('Catalog detail')).not.toBeInTheDocument();
  });

  it('renders visible view fields in position order and ignores hidden fields', () => {
    const fields = [
      { id: 'name-id', name: 'name' },
      { id: 'hidden-id', name: 'hidden' },
      { id: 'subtitle-id', name: 'subtitle' },
      { id: 'detail-id', name: 'detail' },
      { id: 'hidden-image-id', name: 'hiddenImage' },
      { id: 'image-id', name: 'image' },
    ];

    const { container } = renderCatalog({
      fields,
      currentView: {
        type: ViewType.CATALOG,
        isCompact: false,
        viewFields: [
          { fieldMetadataId: 'detail-id', position: 3, isVisible: true },
          { fieldMetadataId: 'hidden-id', position: 0, isVisible: false },
          { fieldMetadataId: 'subtitle-id', position: 2, isVisible: true },
          { fieldMetadataId: 'hidden-image-id', position: 1, isVisible: false },
          { fieldMetadataId: 'image-id', position: 4, isVisible: true },
        ],
      },
      records: [
        {
          name: 'Catalog record title',
          hidden: 'Hidden field value',
          subtitle: 'First visible field',
          detail: 'Second visible field',
          hiddenImage: 'https://example.com/hidden.jpg',
          image: 'https://example.com/visible.jpg',
        },
      ],
    });

    expect(screen.getByText('Catalog record title')).toBeInTheDocument();
    expect(screen.getByText('First visible field')).toBeInTheDocument();
    expect(screen.getByText('Second visible field')).toBeInTheDocument();
    expect(screen.queryByText('Hidden field value')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/visible.jpg',
    );
  });

  it('preserves explicit Catalog roles ahead of unrelated visible fields', () => {
    const fields = [
      { id: 'name-id', name: 'name' },
      { id: 'unrelated-subtitle-id', name: 'unrelatedSubtitle' },
      { id: 'unrelated-image-id', name: 'unrelatedImage' },
      { id: 'legacy-image-id', name: 'legacyImage' },
      { id: 'legacy-subtitle-id', name: 'legacySubtitle' },
      { id: 'legacy-detail-id', name: 'legacyDetail' },
    ];

    const { container } = renderCatalog({
      fields,
      currentView: {
        type: ViewType.CATALOG,
        isCompact: false,
        catalogImageFieldMetadataId: 'legacy-image-id',
        catalogSubtitleFieldMetadataId: 'legacy-subtitle-id',
        catalogDetailFieldMetadataId: 'legacy-detail-id',
        viewFields: [
          {
            fieldMetadataId: 'unrelated-subtitle-id',
            position: 0,
            isVisible: true,
          },
          {
            fieldMetadataId: 'unrelated-image-id',
            position: 1,
            isVisible: true,
          },
          { fieldMetadataId: 'legacy-detail-id', position: 2, isVisible: true },
          { fieldMetadataId: 'legacy-image-id', position: 3, isVisible: true },
          {
            fieldMetadataId: 'legacy-subtitle-id',
            position: 4,
            isVisible: true,
          },
        ],
      },
      records: [
        {
          name: 'Catalog record title',
          unrelatedSubtitle: 'Wrong automatic subtitle',
          unrelatedImage: 'https://example.com/unrelated.jpg',
          legacyImage: 'https://example.com/legacy.jpg',
          legacySubtitle: 'Explicit Catalog subtitle',
          legacyDetail: 'Explicit Catalog detail',
        },
      ],
    });

    expect(screen.getByText('Explicit Catalog subtitle')).toBeInTheDocument();
    expect(screen.getByText('Explicit Catalog detail')).toBeInTheDocument();
    expect(
      screen.queryByText('Wrong automatic subtitle'),
    ).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/legacy.jpg',
    );
  });

  it('uses unlisted legacy roles as a compatibility fallback before migration', () => {
    const fields = [
      { id: 'name-id', name: 'name' },
      { id: 'automatic-subtitle-id', name: 'automaticSubtitle' },
      { id: 'automatic-detail-id', name: 'automaticDetail' },
      { id: 'legacy-image-id', name: 'legacyImage' },
      { id: 'legacy-subtitle-id', name: 'legacySubtitle' },
      { id: 'legacy-detail-id', name: 'legacyDetail' },
    ];

    renderCatalog({
      fields,
      currentView: {
        type: ViewType.CATALOG,
        isCompact: false,
        catalogImageFieldMetadataId: 'legacy-image-id',
        catalogSubtitleFieldMetadataId: 'legacy-subtitle-id',
        catalogDetailFieldMetadataId: 'legacy-detail-id',
        viewFields: [
          {
            fieldMetadataId: 'automatic-subtitle-id',
            position: 0,
            isVisible: true,
          },
          {
            fieldMetadataId: 'automatic-detail-id',
            position: 1,
            isVisible: true,
          },
        ],
      },
      records: [
        {
          name: 'Catalog record title',
          automaticSubtitle: 'Wrong automatic subtitle',
          automaticDetail: 'Wrong automatic detail',
          legacyImage: 'https://example.com/legacy.jpg',
          legacySubtitle: 'Fallback Catalog subtitle',
          legacyDetail: 'Fallback Catalog detail',
        },
      ],
    });

    expect(screen.getByText('Fallback Catalog subtitle')).toBeInTheDocument();
    expect(screen.getByText('Fallback Catalog detail')).toBeInTheDocument();
    expect(
      screen.queryByText('Wrong automatic subtitle'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Wrong automatic detail'),
    ).not.toBeInTheDocument();
  });

  it('does not render hidden role fields and falls back to visible Fields', () => {
    const fields = [
      { id: 'name-id', name: 'name' },
      { id: 'fallback-subtitle-id', name: 'fallbackSubtitle' },
      { id: 'legacy-detail-id', name: 'legacyDetail' },
      { id: 'legacy-subtitle-id', name: 'legacySubtitle' },
      { id: 'legacy-image-id', name: 'legacyImage' },
      { id: 'fallback-detail-id', name: 'fallbackDetail' },
      { id: 'first-fallback-image-id', name: 'firstFallbackImage' },
      { id: 'fallback-image-id', name: 'fallbackImage' },
      { id: 'unlisted-image-id', name: 'unlistedImage' },
    ];

    const { container } = renderCatalog({
      fields,
      currentView: {
        type: ViewType.CATALOG,
        isCompact: false,
        catalogImageFieldMetadataId: 'legacy-image-id',
        catalogSubtitleFieldMetadataId: 'legacy-subtitle-id',
        catalogDetailFieldMetadataId: 'legacy-detail-id',
        viewFields: [
          {
            fieldMetadataId: 'fallback-subtitle-id',
            position: 0,
            isVisible: true,
          },
          {
            fieldMetadataId: 'legacy-detail-id',
            position: 1,
            isVisible: false,
          },
          {
            fieldMetadataId: 'legacy-subtitle-id',
            position: 2,
            isVisible: false,
          },
          { fieldMetadataId: 'legacy-image-id', position: 3, isVisible: false },
          {
            fieldMetadataId: 'fallback-detail-id',
            position: 4,
            isVisible: true,
          },
          {
            fieldMetadataId: 'first-fallback-image-id',
            position: 5,
            isVisible: true,
          },
          {
            fieldMetadataId: 'fallback-image-id',
            position: 6,
            isVisible: true,
          },
        ],
      },
      records: [
        {
          name: 'Catalog record title',
          fallbackSubtitle: 'Visible Fields fallback',
          legacyDetail: 'Hidden role detail',
          legacySubtitle: 'Hidden role subtitle',
          legacyImage: 'https://example.com/hidden-role.jpg',
          fallbackDetail: 'Visible detail fallback',
          firstFallbackImage: 'https://example.com/first-visible.jpg',
          fallbackImage: 'https://example.com/visible-fallback.jpg',
          unlistedImage: 'https://example.com/unlisted.jpg',
        },
      ],
    });

    expect(screen.getByText('Visible Fields fallback')).toBeInTheDocument();
    expect(screen.getByText('Visible detail fallback')).toBeInTheDocument();
    expect(screen.queryByText('Hidden role subtitle')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden role detail')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/first-visible.jpg',
    );
  });

  it('ignores stale and cross-object role IDs and falls back to visible Fields', () => {
    const fields = [
      { id: 'name-id', name: 'name' },
      { id: 'visible-subtitle-id', name: 'visibleSubtitle' },
      { id: 'visible-detail-id', name: 'visibleDetail' },
      { id: 'visible-image-id', name: 'visibleImage' },
    ];

    const { container } = renderCatalog({
      fields,
      currentView: {
        type: ViewType.CATALOG,
        isCompact: false,
        catalogImageFieldMetadataId: 'deleted-image-field-id',
        catalogSubtitleFieldMetadataId: 'other-object-subtitle-field-id',
        catalogDetailFieldMetadataId: 'deleted-detail-field-id',
        viewFields: [
          {
            fieldMetadataId: 'visible-detail-id',
            position: 2,
            isVisible: true,
          },
          { fieldMetadataId: 'visible-image-id', position: 3, isVisible: true },
          {
            fieldMetadataId: 'visible-subtitle-id',
            position: 1,
            isVisible: true,
          },
        ],
      },
      records: [
        {
          name: 'Catalog record title',
          visibleSubtitle: 'Visible subtitle fallback',
          visibleDetail: 'Visible detail fallback',
          visibleImage: 'https://example.com/visible-fallback.jpg',
          deletedImage: 'https://example.com/deleted.jpg',
          otherObjectSubtitle: 'Cross-object value must not render',
          deletedDetail: 'Deleted detail must not render',
        },
      ],
    });

    expect(screen.getByText('Visible subtitle fallback')).toBeInTheDocument();
    expect(screen.getByText('Visible detail fallback')).toBeInTheDocument();
    expect(
      screen.queryByText('Cross-object value must not render'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Deleted detail must not render'),
    ).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/visible-fallback.jpg',
    );
  });

  it('ignores legacy role metadata for non-Catalog views', () => {
    const fields = [
      { id: 'name-id', name: 'name' },
      { id: 'automatic-subtitle-id', name: 'automaticSubtitle' },
      { id: 'automatic-detail-id', name: 'automaticDetail' },
      { id: 'automatic-image-id', name: 'automaticImage' },
      { id: 'legacy-image-id', name: 'legacyImage' },
      { id: 'legacy-subtitle-id', name: 'legacySubtitle' },
      { id: 'legacy-detail-id', name: 'legacyDetail' },
    ];

    const { container } = renderCatalog({
      fields,
      currentView: {
        type: ViewType.TABLE,
        isCompact: false,
        catalogImageFieldMetadataId: 'legacy-image-id',
        catalogSubtitleFieldMetadataId: 'legacy-subtitle-id',
        catalogDetailFieldMetadataId: 'legacy-detail-id',
        viewFields: [
          {
            fieldMetadataId: 'automatic-subtitle-id',
            position: 0,
            isVisible: true,
          },
          {
            fieldMetadataId: 'automatic-detail-id',
            position: 1,
            isVisible: true,
          },
          {
            fieldMetadataId: 'automatic-image-id',
            position: 2,
            isVisible: true,
          },
          { fieldMetadataId: 'legacy-image-id', position: 3, isVisible: true },
          {
            fieldMetadataId: 'legacy-subtitle-id',
            position: 4,
            isVisible: true,
          },
          { fieldMetadataId: 'legacy-detail-id', position: 5, isVisible: true },
        ],
      },
      records: [
        {
          name: 'Record title',
          automaticSubtitle: 'Automatic subtitle',
          automaticDetail: 'Automatic detail',
          automaticImage: 'https://example.com/automatic.jpg',
          legacyImage: 'https://example.com/legacy.jpg',
          legacySubtitle: 'Legacy subtitle must be ignored',
          legacyDetail: 'Legacy detail must be ignored',
        },
      ],
    });

    expect(screen.getByText('Automatic subtitle')).toBeInTheDocument();
    expect(screen.getByText('Automatic detail')).toBeInTheDocument();
    expect(
      screen.queryByText('Legacy subtitle must be ignored'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Legacy detail must be ignored'),
    ).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/automatic.jpg',
    );
  });
});
