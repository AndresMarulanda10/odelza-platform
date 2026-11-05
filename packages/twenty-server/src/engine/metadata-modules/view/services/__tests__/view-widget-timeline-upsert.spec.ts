import { ViewType } from 'twenty-shared/types';
import { ViewWidgetUpsertService } from 'src/engine/metadata-modules/view/services/view-widget-upsert.service';
import { type UpsertViewWidgetInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget.input';

describe('private View widget timeline settings', () => {
  it.each([ViewType.TABLE, ViewType.TIMELINE])(
    'rejects explicit clearing on a non-private view (%s)',
    async (type) => {
      const { service, migrate, related } = setup(type);
      const before = JSON.stringify(related);
      await expect(
        service.upsertViewWidget({
          workspaceId: 'workspace',
          input: { widgetId: 'widget', timelineConfiguration: null },
        }),
      ).rejects.toThrow(
        "Timeline settings require this widget's private view and source",
      );
      expect(migrate).not.toHaveBeenCalled();
      expect(JSON.stringify(related)).toBe(before);
    },
  );

  it('ignores a client-supplied viewId and preserves the widget binding', async () => {
    const { service, migrate } = setup();
    await service.upsertViewWidget({
      workspaceId: 'workspace',
      input: {
        widgetId: 'widget',
        viewId: 'unrelated-native-view',
        timelineConfiguration: null,
      } as UpsertViewWidgetInput & { viewId: string },
    });
    expect(
      migrate.mock.calls[0][0].allFlatEntityOperationByMetadataName.view
        .flatEntityToUpdate[0],
    ).toMatchObject({ id: 'private-view', timelineConfiguration: null });
  });
  const configuration = {
    barColor: '#123456',
    startDateFieldMetadataUniversalIdentifier: null,
    endDateFieldMetadataUniversalIdentifier: null,
  };
  const maps = (
    entities: { id: string; universalIdentifier: string }[] = [],
  ) => ({
    byUniversalIdentifier: Object.fromEntries(
      entities.map((entity) => [entity.universalIdentifier, entity]),
    ),
    universalIdentifierById: Object.fromEntries(
      entities.map((entity) => [entity.id, entity.universalIdentifier]),
    ),
  });
  const setup = (
    type = ViewType.TABLE_WIDGET,
    objectMetadataId = 'company',
  ) => {
    let view = {
      id: 'private-view',
      universalIdentifier: 'private-view-universal',
      type,
      objectMetadataId,
      workspaceId: 'workspace',
      name: 'Private view',
      applicationId: 'custom',
      applicationUniversalIdentifier: 'custom-universal',
      overrides: null,
      universalOverrides: null,
      isSystemSideEffect: false,
      isActive: true,
      timelineConfiguration: configuration,
    };
    const widget = {
      id: 'widget',
      universalIdentifier: 'widget-universal',
      objectMetadataId: 'company',
      configuration: { configurationType: 'RECORD_TABLE', viewId: view.id },
    };
    const related = {
      flatPageLayoutWidgetMaps: maps([widget]),
      flatViewMaps: maps([view]),
      flatFieldMetadataMaps: maps(),
      flatViewFieldMaps: maps(),
      flatViewFilterMaps: maps(),
      flatViewFilterGroupMaps: maps(),
      flatViewSortMaps: maps(),
      flatViewGroupMaps: maps(),
    };
    const migrate = jest.fn(async (args) => {
      view =
        args.allFlatEntityOperationByMetadataName.view?.flatEntityToUpdate[0] ??
        view;
      return { status: 'success' };
    });
    const service = new ViewWidgetUpsertService(
      {
        validateBuildAndRunWorkspaceMigration: migrate,
      } as unknown as ConstructorParameters<typeof ViewWidgetUpsertService>[0],
      {
        getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(async () => related),
      } as unknown as ConstructorParameters<typeof ViewWidgetUpsertService>[1],
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest.fn(
          async () => ({
            workspaceCustomFlatApplication: {
              id: 'custom',
              universalIdentifier: 'custom-universal',
            },
          }),
        ),
      } as unknown as ConstructorParameters<typeof ViewWidgetUpsertService>[2],
      {
        findOne: jest.fn(async () => view),
      } as unknown as ConstructorParameters<typeof ViewWidgetUpsertService>[3],
    );
    return { service, migrate, related };
  };

  it.each([configuration, null])(
    'persists explicit settings %j on the widget-bound private view',
    async (timelineConfiguration) => {
      const { service, migrate } = setup();
      const result = await service.upsertViewWidget({
        input: {
          widgetId: 'widget',
          timelineConfiguration,
        } as UpsertViewWidgetInput,
        workspaceId: 'workspace',
      });
      expect(result.timelineConfiguration).toEqual(timelineConfiguration);
      expect(migrate).toHaveBeenCalledTimes(1);
      expect(
        migrate.mock.calls[0][0].allFlatEntityOperationByMetadataName.view
          .flatEntityToUpdate[0],
      ).toMatchObject({
        id: 'private-view',
        type: ViewType.TABLE_WIDGET,
        objectMetadataId: 'company',
        timelineConfiguration,
      });
    },
  );

  it('preserves an omitted configuration and the existing no-op request', async () => {
    const { service, migrate } = setup();
    const result = await service.upsertViewWidget({
      input: { widgetId: 'widget' },
      workspaceId: 'workspace',
    });
    expect(result.timelineConfiguration).toEqual(configuration);
    expect(migrate).not.toHaveBeenCalled();
  });

  it.each([
    [ViewType.TABLE, 'company'],
    [ViewType.TABLE_WIDGET, 'another-object'],
  ] as const)(
    'rejects a non-private or foreign-object view without mutation (%s/%s)',
    async (type, objectMetadataId) => {
      const { service, migrate, related } = setup(type, objectMetadataId);
      const before = JSON.stringify(related);
      await expect(
        service.upsertViewWidget({
          input: {
            widgetId: 'widget',
            timelineConfiguration: configuration,
          } as UpsertViewWidgetInput,
          workspaceId: 'workspace',
        }),
      ).rejects.toThrow();
      expect(migrate).not.toHaveBeenCalled();
      expect(JSON.stringify(related)).toBe(before);
    },
  );
});
