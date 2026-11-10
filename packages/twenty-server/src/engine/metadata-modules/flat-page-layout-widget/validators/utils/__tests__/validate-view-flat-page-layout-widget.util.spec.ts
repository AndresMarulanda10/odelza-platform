import { ViewType } from 'twenty-shared/types';

import { validateViewFlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-view-flat-page-layout-widget.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

const viewId = 'c8400679-c494-4e01-aec1-8e84916f3c59';
const makeInput = (overrides: Record<string, unknown> = {}) => ({
  flatEntityToValidate: {
    title: 'Planning',
    objectMetadataUniversalIdentifier: 'task',
    universalConfiguration: {
      configurationType: WidgetConfigurationType.VIEW,
      viewId,
    },
  },
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatViewMaps: {
      byUniversalIdentifier: {
        [viewId]: {
          type: ViewType.KANBAN,
          isActive: true,
          objectMetadataUniversalIdentifier: 'task',
          ...overrides,
        },
      } as Record<
        string,
        {
          type: ViewType;
          isActive: boolean;
          objectMetadataUniversalIdentifier: string;
        }
      >,
    },
  },
});
const freeze = (value: object) => {
  Object.freeze(value);
  for (const child of Object.values(value))
    if (child && typeof child === 'object') freeze(child);
};
const validate = (input: ReturnType<typeof makeInput>) =>
  validateViewFlatPageLayoutWidget(
    input as unknown as Parameters<typeof validateViewFlatPageLayoutWidget>[0],
  );

it.each([ViewType.KANBAN, ViewType.TIMELINE])(
  'accepts an active owned %s without mutating frozen metadata',
  (type) => {
    const input = makeInput({ type });
    const before = JSON.stringify(input);
    freeze(input);
    expect(validate(input)).toEqual([]);
    expect(JSON.stringify(input)).toBe(before);
  },
);

it.each([
  { type: ViewType.TABLE },
  { type: ViewType.CALENDAR },
  { isActive: false },
  { objectMetadataUniversalIdentifier: 'other' },
])('rejects unsupported or inaccessible references: %j', (overrides) => {
  const input = makeInput(overrides);
  const before = JSON.stringify(input);
  freeze(input);
  expect(validate(input)).toEqual([
    expect.objectContaining({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    }),
  ]);
  expect(JSON.stringify(input)).toBe(before);
});

it.each(['configuration', 'uuid', 'missing'])('rejects invalid %s', (kind) => {
  const input = makeInput();
  if (kind === 'configuration')
    input.flatEntityToValidate.universalConfiguration.configurationType =
      WidgetConfigurationType.RECORD_TABLE;
  if (kind === 'uuid')
    input.flatEntityToValidate.universalConfiguration.viewId = 'invalid';
  if (kind === 'missing')
    input.optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatViewMaps.byUniversalIdentifier =
      {};
  const before = JSON.stringify(input);
  freeze(input);
  expect(validate(input)).toHaveLength(1);
  expect(JSON.stringify(input)).toBe(before);
});
