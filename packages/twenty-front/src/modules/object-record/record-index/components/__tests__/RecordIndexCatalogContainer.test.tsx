import { render, screen } from '@testing-library/react';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordIndexCatalogContainer } from '@/object-record/record-index/components/RecordIndexCatalogContainer';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewType } from '@/views/types/ViewType';

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
}: {
  fields: { id: string; name: string }[];
  currentView: Record<string, unknown>;
  records: Record<string, unknown>[];
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
  });

  return render(<RecordIndexCatalogContainer />);
};

describe('RecordIndexCatalogContainer', () => {
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
      { id: 'fallback-image-id', name: 'fallbackImage' },
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
          { fieldMetadataId: 'legacy-detail-id', position: 1, isVisible: true },
          {
            fieldMetadataId: 'legacy-subtitle-id',
            position: 2,
            isVisible: false,
          },
          { fieldMetadataId: 'legacy-image-id', position: 3, isVisible: false },
          {
            fieldMetadataId: 'fallback-image-id',
            position: 4,
            isVisible: true,
          },
        ],
      },
      records: [
        {
          name: 'Catalog record title',
          fallbackSubtitle: 'Visible Fields fallback',
          legacyDetail: 'Visible explicit detail',
          legacySubtitle: 'Hidden role subtitle',
          legacyImage: 'https://example.com/hidden-role.jpg',
          fallbackImage: 'https://example.com/visible-fallback.jpg',
        },
      ],
    });

    expect(screen.getByText('Visible Fields fallback')).toBeInTheDocument();
    expect(screen.getByText('Visible explicit detail')).toBeInTheDocument();
    expect(screen.queryByText('Hidden role subtitle')).not.toBeInTheDocument();
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
