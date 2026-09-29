import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

const NEW_WIDGET_CONFIGURATION_TYPE_BY_WIDGET_TYPE: Partial<
  Record<WidgetType, WidgetConfigurationType>
> = {
  [WidgetType.TASK_TIMELINE]: WidgetConfigurationType.TASK_TIMELINE,
  [WidgetType.PERSONAL_FINANCE]: WidgetConfigurationType.PERSONAL_FINANCE,
};

export const validatePageLayoutWidgetTypeConfiguration = ({
  type,
  configuration,
}: {
  type: WidgetType;
  configuration?: { configurationType?: unknown } | null;
}): void => {
  const expectedConfigurationType =
    NEW_WIDGET_CONFIGURATION_TYPE_BY_WIDGET_TYPE[type];

  if (expectedConfigurationType === undefined) {
    return;
  }

  if (configuration?.configurationType !== expectedConfigurationType) {
    throw new PageLayoutWidgetException(
      `Invalid configuration type for widget ${type}. Expected ${expectedConfigurationType}`,
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }
};
