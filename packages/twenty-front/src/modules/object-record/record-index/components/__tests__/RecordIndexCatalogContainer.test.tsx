import { render, screen } from '@testing-library/react';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordIndexCatalogContainer } from '@/object-record/record-index/components/RecordIndexCatalogContainer';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

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

describe('RecordIndexCatalogContainer', () => {
  it('uses the persisted compact setting when rendering Catalog cards', () => {
    const fields = [
      { id: 'name-id', name: 'name' },
      { id: 'subtitle-id', name: 'subtitle' },
      { id: 'detail-id', name: 'detail' },
    ];

    (useRecordIndexContextOrThrow as jest.Mock).mockReturnValue({
      objectNameSingular: 'example',
      objectMetadataItem: { fields },
      labelIdentifierFieldMetadataItem: fields[0],
    });
    (useGetCurrentViewOnly as jest.Mock).mockReturnValue({
      currentView: {
        isCompact: true,
        viewFields: [
          { fieldMetadataId: 'subtitle-id', position: 0 },
          { fieldMetadataId: 'detail-id', position: 1 },
        ],
      },
    });
    (useOpenRecordFromIndexView as jest.Mock).mockReturnValue({
      openRecordFromIndexView: jest.fn(),
    });
    (useRecordIndexTableQuery as jest.Mock).mockReturnValue({
      records: [
        {
          id: 'record-id',
          name: 'Catalog record title',
          subtitle: 'Catalog subtitle',
          detail: 'Catalog detail',
        },
      ],
      loading: false,
      hasNextPage: false,
      fetchMoreRecords: jest.fn(),
    });

    render(<RecordIndexCatalogContainer />);

    expect(screen.getByText('Catalog record title')).toBeInTheDocument();
    expect(screen.queryByText('Catalog subtitle')).not.toBeInTheDocument();
    expect(screen.queryByText('Catalog detail')).not.toBeInTheDocument();
  });
});
