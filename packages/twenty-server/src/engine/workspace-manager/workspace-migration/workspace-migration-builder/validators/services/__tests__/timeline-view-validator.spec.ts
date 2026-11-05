import { FieldMetadataType, ViewType } from 'twenty-shared/types';

import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-validator.service';

describe('saved timeline view configuration', () => {
  const validator = new FlatViewValidatorService();
  const configuration = {
    startDateFieldMetadataUniversalIdentifier: 'start',
    endDateFieldMetadataUniversalIdentifier: 'end',
    barColor: '#123456',
  };
  const makeArgs = (overrides = {}) => {
    const view = {
      universalIdentifier: 'view',
      objectMetadataUniversalIdentifier: 'task',
      type: 'TIMELINE' as ViewType,
      timelineConfiguration: configuration,
      ...overrides,
    };
    const fields = {
      start: {
        universalIdentifier: 'start',
        objectMetadataUniversalIdentifier: 'task',
        type: FieldMetadataType.DATE,
        isActive: true,
        deletedAt: null as string | null,
      },
      end: {
        universalIdentifier: 'end',
        objectMetadataUniversalIdentifier: 'task',
        type: FieldMetadataType.DATE_TIME,
        isActive: true,
        deletedAt: null as string | null,
      },
    };
    return {
      flatEntityToValidate: view,
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
        flatViewMaps: { byUniversalIdentifier: {} },
        flatFieldMetadataMaps: { byUniversalIdentifier: fields },
        flatObjectMetadataMaps: { byUniversalIdentifier: { task: {} } },
      },
    };
  };

  it('accepts date/date-time universal mappings without mutating input', () => {
    const args = makeArgs();
    const before = JSON.stringify(args);
    const result = validator.validateFlatViewCreation(
      args as unknown as UniversalFlatEntityValidationArgs<'view'>,
    );
    expect(result.errors).toEqual([]);
    expect(JSON.stringify(args)).toBe(before);
  });

  it.each([
    null,
    {},
    {
      startDateFieldMetadataUniversalIdentifier: null,
      endDateFieldMetadataUniversalIdentifier: null,
      barColor: null,
    },
    { barColor: '#aAbB09' },
  ])(
    'accepts unconfigured or color-only settings %j',
    (timelineConfiguration) => {
      expect(
        validator.validateFlatViewCreation(
          makeArgs({
            timelineConfiguration,
          }) as unknown as UniversalFlatEntityValidationArgs<'view'>,
        ).errors,
      ).toEqual([]);
    },
  );

  it.each([
    '',
    [],
    0,
    { barColor: '#123' },
    { barColor: 'red' },
    {
      startDateFieldMetadataUniversalIdentifier: 'missing',
    },
  ])(
    'rejects malformed settings %j without mutation',
    (timelineConfiguration) => {
      const args = makeArgs({ timelineConfiguration });
      const before = JSON.stringify(args);
      expect(
        validator.validateFlatViewCreation(
          args as unknown as UniversalFlatEntityValidationArgs<'view'>,
        ).errors,
      ).toEqual([
        expect.objectContaining({
          code: 'INVALID_VIEW_DATA',
          message:
            'Timeline configuration must use active date fields from this object and a valid bar color',
        }),
      ]);
      expect(JSON.stringify(args)).toBe(before);
    },
  );

  it('allows clearing an invalid stored configuration with null', () => {
    const args = makeArgs({ timelineConfiguration: { barColor: 'red' } });
    const update = {
      universalIdentifier: 'view',
      flatEntityUpdate: { timelineConfiguration: null },
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
        ...args.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        flatViewMaps: {
          byUniversalIdentifier: { view: args.flatEntityToValidate },
        },
      },
    };
    expect(
      validator.validateFlatViewUpdate(
        update as unknown as FlatEntityUpdateValidationArgs<'view'>,
      ).errors,
    ).toEqual([]);
  });

  it.each(['missing', 'inactive', 'wrong-object', 'wrong-type'])(
    'rejects a %s mapped field on create and update',
    (reason) => {
      const args = makeArgs();
      const related = args.optimisticFlatEntityMapsAndRelatedFlatEntityMaps;
      const field = related.flatFieldMetadataMaps.byUniversalIdentifier.start;
      if (reason === 'missing')
        Reflect.deleteProperty(
          related.flatFieldMetadataMaps.byUniversalIdentifier,
          'start',
        );
      if (reason === 'inactive') field.isActive = false;
      if (reason === 'wrong-object')
        field.objectMetadataUniversalIdentifier = 'company';
      if (reason === 'wrong-type') field.type = FieldMetadataType.TEXT;
      const before = JSON.stringify(args);
      expect(
        validator.validateFlatViewCreation(
          args as unknown as UniversalFlatEntityValidationArgs<'view'>,
        ).errors,
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: 'INVALID_VIEW_DATA' }),
        ]),
      );
      expect(JSON.stringify(args)).toBe(before);
      const update = {
        universalIdentifier: 'view',
        flatEntityUpdate: { timelineConfiguration: configuration },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          ...related,
          flatViewMaps: {
            byUniversalIdentifier: { view: args.flatEntityToValidate },
          },
        },
      };
      expect(
        validator.validateFlatViewUpdate(
          update as unknown as FlatEntityUpdateValidationArgs<'view'>,
        ).errors,
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: 'INVALID_VIEW_DATA' }),
        ]),
      );
    },
  );

  it('validates effective override configuration, not just the base view', () => {
    const args = makeArgs({
      universalOverrides: {
        timelineConfiguration: { ...configuration, barColor: 'invalid-color' },
      },
    });
    expect(
      validator.validateFlatViewCreation(
        args as unknown as UniversalFlatEntityValidationArgs<'view'>,
      ).errors,
    ).not.toEqual([]);
  });

  it.each([ViewType.TABLE, ViewType.CALENDAR, ViewType.CATALOG])(
    'preserves legacy %s validation with no timeline configuration',
    (type) => {
      const args = makeArgs({ type, timelineConfiguration: null });
      expect(
        validator.validateFlatViewCreation(
          args as unknown as UniversalFlatEntityValidationArgs<'view'>,
        ).errors,
      ).toEqual([]);
    },
  );
});
