import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromPageLayoutWidgetConfigurationToUniversalConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util';
import { fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/utils/from-universal-configuration-to-flat-page-layout-widget-configuration.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const configurations = [
  { configurationType: WidgetConfigurationType.TASK_TIMELINE as const },
  { configurationType: WidgetConfigurationType.PERSONAL_FINANCE as const },
] as const;

describe('new page-layout widget configuration persistence', () => {
  it.each(configurations)(
    'round-trips the $configurationType envelope',
    (configuration) => {
      const universalConfiguration =
        fromPageLayoutWidgetConfigurationToUniversalConfiguration({
          configuration,
          fieldMetadataUniversalIdentifierById: {},
        });

      const restoredConfiguration =
        fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration({
          universalConfiguration,
          flatFieldMetadataMaps: createEmptyFlatEntityMaps() as never,
          flatFrontComponentMaps: createEmptyFlatEntityMaps() as never,
          flatViewMaps: createEmptyFlatEntityMaps() as never,
          flatViewFieldGroupMaps: createEmptyFlatEntityMaps() as never,
        });

      expect(universalConfiguration).toEqual(configuration);
      expect(restoredConfiguration).toEqual(configuration);
    },
  );
});
