import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import {
  widgetConfigurationSchema,
  widgetTypeSchema,
} from 'src/modules/dashboard/tools/schemas/widget.schema';

describe('widget schemas', () => {
  it('accepts VIEW widgets with a view configuration', () => {
    const result = widgetConfigurationSchema.parse({
      configurationType: WidgetConfigurationType.VIEW,
      viewId: '20202020-aaaa-4d02-bf25-6aeccf7ea419',
    });

    expect(result).toEqual({
      configurationType: WidgetConfigurationType.VIEW,
      viewId: '20202020-aaaa-4d02-bf25-6aeccf7ea419',
    });
  });

  it('continues to expose VIEW as a supported widget type', () => {
    expect(widgetTypeSchema.parse(WidgetType.VIEW)).toBe(WidgetType.VIEW);
  });
});
