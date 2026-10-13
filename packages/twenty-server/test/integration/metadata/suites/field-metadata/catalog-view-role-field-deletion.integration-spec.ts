import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';

describe('Catalog view role field deletion', () => {
  let objectMetadataId: string | undefined;

  afterAll(async () => {
    if (!objectMetadataId) {
      return;
    }

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it('preserves the view and unrelated Catalog roles when a mapped field is deleted', async () => {
    const createdObject = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'catalogRoleDeletionObject',
        namePlural: 'catalogRoleDeletionObjects',
        labelSingular: 'Catalog Role Deletion Object',
        labelPlural: 'Catalog Role Deletion Objects',
        icon: 'IconBox',
        isLabelSyncedWithName: false,
      },
    });

    const createdObjectMetadataId = createdObject.data.createOneObject.id;

    objectMetadataId = createdObjectMetadataId;

    const createField = async (name: string, label: string) => {
      const response = await createOneFieldMetadata({
        expectToFail: false,
        input: {
          name,
          label,
          type: FieldMetadataType.TEXT,
          objectMetadataId: createdObjectMetadataId,
          isLabelSyncedWithName: false,
        },
        gqlFields: 'id',
      });

      return response.data.createOneField.id;
    };

    const imageFieldId = await createField(
      'catalogImageForDeletion',
      'Catalog Image For Deletion',
    );
    const subtitleFieldId = await createField(
      'catalogSubtitleForDeletion',
      'Catalog Subtitle For Deletion',
    );
    const detailFieldId = await createField(
      'catalogDetailForDeletion',
      'Catalog Detail For Deletion',
    );

    const createdView = await createOneView({
      expectToFail: false,
      input: {
        name: 'catalogRoleDeletionView',
        objectMetadataId: createdObjectMetadataId,
        icon: 'IconList',
        type: ViewType.CATALOG,
        isCompact: true,
        catalogImageFieldMetadataId: imageFieldId,
        catalogSubtitleFieldMetadataId: subtitleFieldId,
        catalogDetailFieldMetadataId: detailFieldId,
      },
      gqlFields:
        'id name type isCompact catalogImageFieldMetadataId catalogSubtitleFieldMetadataId catalogDetailFieldMetadataId',
    });
    const viewId = createdView.data.createView.id;

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: imageFieldId,
        updatePayload: { isActive: false },
      },
      gqlFields: 'id',
    });
    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: imageFieldId },
    });

    const foundViews = await findViews({
      objectMetadataId: createdObjectMetadataId,
      expectToFail: false,
      gqlFields:
        'id name type isCompact catalogImageFieldMetadataId catalogSubtitleFieldMetadataId catalogDetailFieldMetadataId',
    });
    const viewAfterDeletion = foundViews.data.getViews.find(
      ({ id }) => id === viewId,
    );

    expect(viewAfterDeletion).toEqual({
      id: viewId,
      name: 'catalogRoleDeletionView',
      type: ViewType.CATALOG,
      isCompact: true,
      catalogImageFieldMetadataId: null,
      catalogSubtitleFieldMetadataId: subtitleFieldId,
      catalogDetailFieldMetadataId: detailFieldId,
    });
  });
});
