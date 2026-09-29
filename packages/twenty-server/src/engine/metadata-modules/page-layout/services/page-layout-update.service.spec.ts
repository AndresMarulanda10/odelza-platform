import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { PageLayoutUpdateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-update.service';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

describe('PageLayoutUpdateService widget duplication', () => {
  it.each([
    {
      type: WidgetType.TASK_TIMELINE,
      configurationType: WidgetConfigurationType.TASK_TIMELINE,
    },
    {
      type: WidgetType.PERSONAL_FINANCE,
      configurationType: WidgetConfigurationType.PERSONAL_FINANCE,
    },
  ])(
    'preserves $type configuration when a copy receives a new id',
    ({ type, configurationType }) => {
      const pageLayoutTabMaps = createEmptyFlatEntityMaps() as any;
      pageLayoutTabMaps.universalIdentifierById.tab = 'tab-universal-id';
      const emptyMaps = () => createEmptyFlatEntityMaps() as any;
      const service = new PageLayoutUpdateService(
        undefined as never,
        undefined as never,
        undefined as never,
        undefined as never,
        undefined as never,
      );

      const operations = (service as any).computeWidgetOperationsForTab({
        tabId: 'tab',
        widgets: [
          {
            id: 'copied-widget',
            pageLayoutTabId: 'tab',
            title: 'Copied widget',
            type,
            objectMetadataId: null,
            gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
            configuration: { configurationType },
          },
        ],
        widgetIdsAcrossAllTabs: new Set(['copied-widget']),
        flatPageLayoutWidgetMaps: emptyMaps(),
        flatPageLayoutTabMaps: pageLayoutTabMaps,
        flatObjectMetadataMaps: emptyMaps(),
        flatFieldMetadataMaps: emptyMaps(),
        flatFrontComponentMaps: emptyMaps(),
        flatViewFieldGroupMaps: emptyMaps(),
        flatViewMaps: emptyMaps(),
        workspaceId: 'workspace',
        workspaceCustomApplicationId: 'application',
        workspaceCustomApplicationUniversalIdentifier:
          'application-universal-id',
      });

      expect(operations.widgetsToCreate).toHaveLength(1);
      expect(operations.widgetsToCreate[0]).toMatchObject({
        id: 'copied-widget',
        configuration: { configurationType },
        universalConfiguration: { configurationType },
      });
    },
  );
});
