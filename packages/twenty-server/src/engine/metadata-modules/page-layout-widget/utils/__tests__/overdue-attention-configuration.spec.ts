import { validateWidgetConfigurationInput } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-configuration-input.util';
import { RecordTableConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/record-table-configuration.dto';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { fromPageLayoutWidgetConfigurationToUniversalConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util';
import { fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/utils/from-universal-configuration-to-flat-page-layout-widget-configuration.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

describe('record table presentation configuration (offline)', () => {
  it.each([undefined, null, 'TABLE', 'OVERDUE_ATTENTION'])(
    'accepts backward-compatible mode %s through actual validator dispatch',
    (presentationMode) => {
      expect(() =>
        validateWidgetConfigurationInput({
          configuration: {
            configurationType: 'RECORD_TABLE',
            recordLimit: 5,
            presentationMode,
          },
        }),
      ).not.toThrow();
    },
  );
  it.each(['ATTENTION', '', 4, {}, []])(
    'rejects unknown mode %j',
    (presentationMode) => {
      expect(() =>
        validateWidgetConfigurationInput({
          configuration: {
            configurationType: 'RECORD_TABLE',
            presentationMode,
          },
        }),
      ).toThrow();
    },
  );
  it('does not change ordinary table limit validation', () => {
    expect(
      validateSync(
        plainToInstance(RecordTableConfigurationDTO, {
          configurationType: 'RECORD_TABLE',
          recordLimit: 0,
          presentationMode: 'TABLE',
        }),
      ).map((error) => error.property),
    ).toEqual(['recordLimit']);
  });
  it.each([undefined, null, 'TABLE', 'OVERDUE_ATTENTION'] as const)(
    'retains mode %s and limit in both real flat/universal converters',
    (presentationMode) => {
      const configuration = {
        configurationType: WidgetConfigurationType.RECORD_TABLE as const,
        recordLimit: 5,
        presentationMode,
      };
      const universalConfiguration =
        fromPageLayoutWidgetConfigurationToUniversalConfiguration({
          configuration,
          fieldMetadataUniversalIdentifierById: {},
        });
      const restored =
        fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration({
          universalConfiguration,
          flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
          flatFrontComponentMaps: createEmptyFlatEntityMaps(),
          flatViewMaps: createEmptyFlatEntityMaps(),
          flatViewFieldGroupMaps: createEmptyFlatEntityMaps(),
        });
      expect(restored).toMatchObject(configuration);
    },
  );
});
