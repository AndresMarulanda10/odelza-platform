import { msg, t } from '@lingui/core/macro';
import { ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { validate as uuidValidate } from 'uuid';

import { type GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateViewFlatPageLayoutWidget = ({
  flatEntityToValidate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
}: GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs): FlatPageLayoutWidgetValidationError[] => {
  const { universalConfiguration, title: widgetTitle } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (
    !isDefined(universalConfiguration) ||
    universalConfiguration.configurationType !== WidgetConfigurationType.VIEW
  ) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Invalid configuration type for view widget "${widgetTitle}". Expected VIEW`,
      userFriendlyMessage: msg`Invalid configuration type for view widget`,
      value: universalConfiguration?.configurationType,
    });

    return errors;
  }

  const viewUniversalIdentifier = universalConfiguration.viewId;

  if (
    typeof viewUniversalIdentifier !== 'string' ||
    !uuidValidate(viewUniversalIdentifier)
  ) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Invalid view reference for view widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Invalid view reference for view widget`,
      value: viewUniversalIdentifier,
    });

    return errors;
  }

  const view =
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatViewMaps
      .byUniversalIdentifier[viewUniversalIdentifier];

  if (!isDefined(view)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`View ${viewUniversalIdentifier} referenced by widget "${widgetTitle}" was not found`,
      userFriendlyMessage: msg`Referenced view was not found`,
      value: viewUniversalIdentifier,
    });

    return errors;
  }

  if (!view.isActive) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`View ${viewUniversalIdentifier} referenced by widget "${widgetTitle}" is inactive`,
      userFriendlyMessage: msg`Referenced view is inactive`,
      value: viewUniversalIdentifier,
    });
  }

  if (
    view.objectMetadataUniversalIdentifier !==
    flatEntityToValidate.objectMetadataUniversalIdentifier
  ) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`View ${viewUniversalIdentifier} referenced by widget "${widgetTitle}" belongs to another object`,
      userFriendlyMessage: msg`Referenced view belongs to another object`,
      value: viewUniversalIdentifier,
    });
  }

  if (view.type !== ViewType.KANBAN) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`View ${viewUniversalIdentifier} referenced by widget "${widgetTitle}" is not a Kanban view`,
      userFriendlyMessage: msg`Referenced view is not a Kanban view`,
      value: view.type,
    });
  }

  return errors;
};
