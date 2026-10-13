import { renderHook } from '@testing-library/react';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { ViewType } from '@/views/types/ViewType';

const object = getMockObjectMetadataItemOrThrow('person');
const legacyField = object.fields.find((field) => field.name === 'city')!;
let rows: unknown[] = [];
let persistedRows: unknown[] = [];
let canPersistChanges = false;
let canReadObjectRecords = true;
let readableFields = [legacyField];

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [object] }),
}));
jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => ({
    fieldMetadataItemByFieldMetadataItemId: {},
    objectPermissionsByObjectMetadataId: {
      [object.id]: { canReadObjectRecords },
    },
  }),
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue',
  () => ({
    useAtomComponentSelectorValue: () => [],
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: (state: { key: string }) =>
      state.key === 'currentRecordFieldsComponentState' ? rows : [],
  }),
);
jest.mock('@/views/hooks/useGetCurrentViewOnly', () => ({
  useGetCurrentViewOnly: () => ({
    currentView: {
      type: ViewType.CATALOG,
      viewFields: persistedRows,
      catalogSubtitleFieldMetadataId: legacyField.id,
      catalogDetailFieldMetadataId: 'foreign-or-stale-field',
    },
  }),
}));
jest.mock('@/views/hooks/useCanPersistViewChanges', () => ({
  useCanPersistViewChanges: () => ({ canPersistChanges }),
}));

describe('Catalog legacy query selection', () => {
  beforeEach(() => {
    rows = [];
    persistedRows = [];
    canPersistChanges = false;
    canReadObjectRecords = true;
    readableFields = [legacyField];
  });

  const useTestFields = () =>
    useRelevantRecordsGqlFields({
      objectMetadataItem: { ...object, readableFields },
    });

  it('generates the real depth-one selection for a readable no-row fallback', () => {
    const { result } = renderHook(useTestFields);
    expect(result.current).toHaveProperty('city', true);
    expect(result.current).not.toHaveProperty('foreign-or-stale-field');
  });

  it.each(['local', 'persisted', 'denied', 'writable', 'object-denied'])(
    'does not request fallback fields when %s',
    (boundary) => {
      if (boundary === 'local')
        rows = [{ fieldMetadataItemId: legacyField.id, isVisible: false }];
      if (boundary === 'persisted')
        persistedRows = [{ fieldMetadataId: legacyField.id, isVisible: false }];
      if (boundary === 'denied') readableFields = [];
      if (boundary === 'writable') canPersistChanges = true;
      if (boundary === 'object-denied') canReadObjectRecords = false;
      const { result } = renderHook(useTestFields);
      expect(result.current).not.toHaveProperty('city');
    },
  );
});
