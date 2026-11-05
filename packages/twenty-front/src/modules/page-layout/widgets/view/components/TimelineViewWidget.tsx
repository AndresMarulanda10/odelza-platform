import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { TimelineView } from '@/object-record/record-index/components/RecordIndexTimelineContainer';
import { useFindManyTimelineViewParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useTimelineViewWidgetQueryState } from '@/page-layout/widgets/view/hooks/useTimelineViewWidgetQueryState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type View } from '@/views/types/View';

type Props = {
  view: View;
  objectMetadataItem: EnrichedObjectMetadataItem;
  widgetId: string;
  recordLimit?: number;
};

const TimelineViewWidgetData = ({
  view,
  objectMetadataItem,
  instanceId,
  recordLimit,
}: Omit<Props, 'widgetId'> & { instanceId: string }) => {
  const query = useFindManyTimelineViewParams(
    objectMetadataItem.nameSingular,
    instanceId,
  );
  return (
    <TimelineView
      view={view}
      objectMetadataItem={objectMetadataItem}
      instanceId={instanceId}
      query={
        recordLimit === undefined ? query : { ...query, limit: recordLimit }
      }
      recordLimit={recordLimit}
    />
  );
};

const TimelineViewWidgetScope = ({
  view,
  objectMetadataItem,
  widgetId,
  recordLimit,
}: Props) => {
  const instanceId = `view-timeline-widget-${widgetId}`;
  const ready = useTimelineViewWidgetQueryState(
    view,
    objectMetadataItem,
    instanceId,
  );
  return (
    <ContextStoreComponentInstanceContext.Provider value={{ instanceId }}>
      <ViewComponentInstanceContext.Provider value={{ instanceId }}>
        <RecordComponentInstanceContextsWrapper
          componentInstanceId={instanceId}
        >
          {ready && (
            <TimelineViewWidgetData
              view={view}
              objectMetadataItem={objectMetadataItem}
              instanceId={instanceId}
              recordLimit={recordLimit}
            />
          )}
        </RecordComponentInstanceContextsWrapper>
      </ViewComponentInstanceContext.Provider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};

export const TimelineViewWidget = (props: Props) => (
  <TimelineViewWidgetScope key={props.view.id} {...props} />
);
