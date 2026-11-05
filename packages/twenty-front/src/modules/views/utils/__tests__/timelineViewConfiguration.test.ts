import { FieldMetadataType } from 'twenty-shared/types';

import {
  getDefaultTimelineViewConfiguration,
  resolveTimelineViewFieldMapping,
} from '@/views/utils/timelineViewConfiguration';

const fields = [
  {
    id: 'start',
    universalIdentifier: 'start-universal',
    name: 'startDate',
    isActive: true,
    type: FieldMetadataType.DATE,
  },
  {
    id: 'end',
    universalIdentifier: 'end-universal',
    name: 'dueAt',
    isActive: true,
    type: FieldMetadataType.DATE_TIME,
  },
];

describe('saved timeline field mapping', () => {
  it('prefers the Task endDate field before dueAt regardless of metadata ordering', () => {
    expect(
      getDefaultTimelineViewConfiguration([
        ...fields,
        {
          id: 'explicit-end',
          universalIdentifier: 'explicit-end-universal',
          name: 'endDate',
          isActive: true,
          type: FieldMetadataType.DATE,
        },
      ]).endDateFieldMetadataUniversalIdentifier,
    ).toBe('explicit-end-universal');
  });
  it('stores universal references and resolves remapped local field IDs', () => {
    const configuration = getDefaultTimelineViewConfiguration(fields);
    expect(configuration).toMatchObject({
      startDateFieldMetadataUniversalIdentifier: 'start-universal',
      endDateFieldMetadataUniversalIdentifier: 'end-universal',
    });
    expect(
      resolveTimelineViewFieldMapping(
        configuration,
        fields.map((field) => ({ ...field, id: `${field.id}-new` })),
      ),
    ).toEqual({
      startDateFieldMetadataId: 'start-new',
      dueDateFieldMetadataId: 'end-new',
    });
  });

  it('leaves absent or unavailable date mappings unconfigured without fallback', () => {
    expect(resolveTimelineViewFieldMapping(null, fields)).toEqual({
      startDateFieldMetadataId: null,
      dueDateFieldMetadataId: null,
    });
    expect(
      resolveTimelineViewFieldMapping(
        { startDateFieldMetadataUniversalIdentifier: 'removed' },
        fields,
      ),
    ).toEqual({ startDateFieldMetadataId: null, dueDateFieldMetadataId: null });
    expect(getDefaultTimelineViewConfiguration([])).toMatchObject({
      startDateFieldMetadataUniversalIdentifier: null,
      endDateFieldMetadataUniversalIdentifier: null,
    });
  });
});
