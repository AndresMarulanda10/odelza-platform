import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { ViewWidgetRendererContent } from '@/page-layout/widgets/view/components/ViewWidgetRendererContent';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

type ViewWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const ViewWidgetRenderer = ({ widget }: ViewWidgetRendererProps) => {
  const { configuration } = widget;
  const viewId =
    configuration.configurationType === WidgetConfigurationType.VIEW &&
    'viewId' in configuration &&
    typeof configuration.viewId === 'string'
      ? configuration.viewId
      : undefined;

  if (
    !isDefined(widget.objectMetadataId) ||
    !isDefined(viewId) ||
    viewId === ''
  ) {
    return null;
  }

  return (
    <ViewWidgetRendererContent
      objectMetadataId={widget.objectMetadataId}
      viewId={viewId}
      widgetId={widget.id}
    />
  );
};
