import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromPageLayoutWidgetConfigurationToUniversalConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util';
import { fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/utils/from-universal-configuration-to-flat-page-layout-widget-configuration.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const configurations = [
  { configurationType: WidgetConfigurationType.TASK_TIMELINE as const },
  { configurationType: WidgetConfigurationType.PERSONAL_FINANCE as const },
] as const;

const financeConfiguration = {
  configurationType: WidgetConfigurationType.PERSONAL_FINANCE as const,
  source: {
    incomeFieldMetadataId: 'income-field',
    expenseFieldMetadataId: 'expense-field',
  },
};

const financeFieldMetadataUniversalIdentifierById = {
  'income-field': 'income-universal',
  'expense-field': 'expense-universal',
};

const timelineConfiguration = {
  configurationType: WidgetConfigurationType.TASK_TIMELINE as const,
  fieldMapping: {
    titleFieldMetadataId: 'title-field',
    startDateFieldMetadataId: 'start-field',
    dueDateFieldMetadataId: 'due-field',
    progressFieldMetadataId: 'progress-field',
    statusFieldMetadataId: 'status-field',
    milestoneFieldMetadataId: 'milestone-field',
    dependencyFieldMetadataId: 'dependency-field',
    dependencyTypeFieldMetadataId: 'dependency-type-field',
  },
};

const timelineFieldMetadataUniversalIdentifierById = {
  'title-field': 'title-universal',
  'start-field': 'start-universal',
  'due-field': 'due-universal',
  'progress-field': 'progress-universal',
  'status-field': 'status-universal',
  'milestone-field': 'milestone-universal',
  'dependency-field': 'dependency-universal',
  'dependency-type-field': 'dependency-type-universal',
};

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

  it('round-trips mapped finance field metadata IDs', () => {
    const universalConfiguration =
      fromPageLayoutWidgetConfigurationToUniversalConfiguration({
        configuration: financeConfiguration,
        fieldMetadataUniversalIdentifierById:
          financeFieldMetadataUniversalIdentifierById,
      });

    const restoredConfiguration =
      fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration({
        universalConfiguration,
        flatFieldMetadataMaps: {
          byUniversalIdentifier: Object.fromEntries(
            Object.entries(financeFieldMetadataUniversalIdentifierById).map(
              ([id, universalIdentifier]) => [universalIdentifier, { id }],
            ),
          ),
        } as never,
      } as never);

    expect(restoredConfiguration).toEqual(financeConfiguration);
  });

  it('round-trips mapped timeline field metadata IDs', () => {
    const universalConfiguration =
      fromPageLayoutWidgetConfigurationToUniversalConfiguration({
        configuration: timelineConfiguration,
        fieldMetadataUniversalIdentifierById:
          timelineFieldMetadataUniversalIdentifierById,
      });

    const restoredConfiguration =
      fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration({
        universalConfiguration,
        flatFieldMetadataMaps: {
          byUniversalIdentifier: Object.fromEntries(
            Object.entries(timelineFieldMetadataUniversalIdentifierById).map(
              ([id, universalIdentifier]) => [universalIdentifier, { id }],
            ),
          ),
        } as never,
      } as never);

    expect(restoredConfiguration).toEqual(timelineConfiguration);
  });
});
