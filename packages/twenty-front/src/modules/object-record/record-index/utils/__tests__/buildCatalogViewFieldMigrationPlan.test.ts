import { buildCatalogViewFieldMigrationPlan } from '@/object-record/record-index/utils/buildCatalogViewFieldMigrationPlan';
import { type ViewField } from '@/views/types/ViewField';

describe('buildCatalogViewFieldMigrationPlan', () => {
  it('deduplicates role IDs, appends missing fields, and preserves existing fields', () => {
    const viewFields: Omit<ViewField, 'definition'>[] = [
      {
        id: 'unrelated-first',
        fieldMetadataId: 'unrelated-first-id',
        position: 0,
        isActive: true,
        isVisible: true,
        size: 180,
      },
      {
        id: 'legacy-subtitle',
        fieldMetadataId: 'subtitle-id',
        position: 3,
        isActive: true,
        isVisible: false,
        size: 240,
        viewFieldGroupId: 'group-id',
      },
      {
        id: 'unrelated-last',
        fieldMetadataId: 'unrelated-last-id',
        position: 5,
        isActive: true,
        isVisible: true,
        size: 120,
      },
    ];

    const plan = buildCatalogViewFieldMigrationPlan({
      availableFieldMetadataIds: [
        'image-id',
        'subtitle-id',
        'detail-id',
        'unrelated-first-id',
        'unrelated-last-id',
      ],
      createId: jest
        .fn()
        .mockReturnValueOnce('new-image-view-field')
        .mockReturnValueOnce('new-detail-view-field'),
      legacyRoleFieldMetadataIds: [
        'image-id',
        'subtitle-id',
        'detail-id',
        'image-id',
        null,
      ],
      viewFields,
    });

    expect(plan.legacyRoleFieldMetadataIds).toEqual([
      'image-id',
      'subtitle-id',
      'detail-id',
    ]);
    expect(plan.viewFieldsToCreate).toEqual([
      expect.objectContaining({
        id: 'new-image-view-field',
        fieldMetadataId: 'image-id',
        position: 6,
        isVisible: true,
      }),
      expect.objectContaining({
        id: 'new-detail-view-field',
        fieldMetadataId: 'detail-id',
        position: 7,
        isVisible: true,
      }),
    ]);
    expect(
      plan.viewFieldsToCreate.map(({ fieldMetadataId }) => fieldMetadataId),
    ).not.toContain('subtitle-id');
    expect(viewFields.map(({ fieldMetadataId }) => fieldMetadataId)).toEqual([
      'unrelated-first-id',
      'subtitle-id',
      'unrelated-last-id',
    ]);
    expect(viewFields[1]).toMatchObject({
      position: 3,
      size: 240,
      viewFieldGroupId: 'group-id',
      isVisible: false,
    });
  });

  it('is idempotent after the migrated view fields have been saved', () => {
    const viewFields: Omit<ViewField, 'definition'>[] = [
      {
        id: 'existing-subtitle',
        fieldMetadataId: 'subtitle-id',
        position: 0,
        isActive: true,
        isVisible: true,
        size: 100,
      },
      {
        id: 'existing-image',
        fieldMetadataId: 'image-id',
        position: 1,
        isActive: true,
        isVisible: true,
        size: 100,
      },
    ];

    const plan = buildCatalogViewFieldMigrationPlan({
      availableFieldMetadataIds: ['image-id', 'subtitle-id'],
      legacyRoleFieldMetadataIds: ['image-id', 'subtitle-id', 'image-id'],
      viewFields,
    });

    expect(plan.viewFieldsToCreate).toEqual([]);
    expect(plan.viewFieldsToCreate).toEqual([]);
  });

  it('does not unhide a role field already hidden in Fields', () => {
    const hiddenViewField: Omit<ViewField, 'definition'> = {
      id: 'view-field-id',
      fieldMetadataId: 'image-id',
      position: 0,
      isActive: true,
      isVisible: false,
      size: 100,
    };

    const plan = buildCatalogViewFieldMigrationPlan({
      availableFieldMetadataIds: ['image-id'],
      legacyRoleFieldMetadataIds: ['image-id'],
      viewFields: [hiddenViewField],
    });

    expect(plan.viewFieldsToCreate).toEqual([]);
    expect(hiddenViewField.isVisible).toBe(false);
  });
});
