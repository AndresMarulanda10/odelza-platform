import { type ReactNode, useState } from 'react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useFindManyTimelineViewParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { TimelineViewSettings } from '@/object-record/record-index/components/TimelineViewSettings';
import { TaskTimeline } from '@/page-layout/widgets/task-timeline/components/TaskTimelineWidget';
import { useTimelineData } from '@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { type View } from '@/views/types/View';
import { resolveTimelineViewFieldMapping } from '@/views/utils/timelineViewConfiguration';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;
const StyledTimeline = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;
const StyledFooter = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

type TimelineViewProps = {
  view: Pick<View, 'id' | 'objectMetadataId' | 'timelineConfiguration'>;
  objectMetadataItem: EnrichedObjectMetadataItem;
  instanceId: string;
  query: NonNullable<Parameters<typeof useTimelineData>[0]['query']>;
  settings?: ReactNode;
  recordLimit?: number;
};

// The saved-view widget can use this controller without native index state.
export const TimelineView = ({
  view,
  objectMetadataItem,
  instanceId,
  query,
  settings,
  recordLimit,
}: TimelineViewProps) => {
  const data = useTimelineData({
    sourceObjectMetadataId: view.objectMetadataId,
    fieldMapping: resolveTimelineViewFieldMapping(
      view.timelineConfiguration,
      objectMetadataItem.fields,
    ),
    query,
    requireConfiguredDates: true,
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageError, setPageError] = useState<string>();
  const loadMore = async () => {
    if (loadingMore || !data.loadMore) return;
    setLoadingMore(true);
    setPageError(undefined);
    try {
      await data.loadMore();
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : t`Unable to load more records.`,
      );
    } finally {
      setLoadingMore(false);
    }
  };
  return (
    <StyledContainer>
      {settings}
      {data.hasConfigurationGap && (
        <StyledFooter role="status">{t`Configure readable start and end date fields in this view’s settings.`}</StyledFooter>
      )}
      <StyledTimeline>
        <TaskTimeline
          instanceId={instanceId}
          data={
            recordLimit === undefined
              ? data
              : {
                  ...data,
                  items: data.items.slice(0, recordLimit),
                  hasNextPage: false,
                }
          }
          barColor={view.timelineConfiguration?.barColor}
          configurationScope="view"
        />
      </StyledTimeline>
      {recordLimit === undefined && (data.hasNextPage || pageError) && (
        <StyledFooter>
          {pageError && <span role="alert">{pageError}</span>}
          <Button
            title={loadingMore ? t`Loading…` : t`Load more`}
            disabled={loadingMore}
            onClick={loadMore}
          />
        </StyledFooter>
      )}
    </StyledContainer>
  );
};

export const RecordIndexTimelineContainer = () => {
  const { objectMetadataItem, recordIndexId } = useRecordIndexContextOrThrow();
  const { currentView } = useGetCurrentViewOnly();
  const query = useFindManyTimelineViewParams(
    objectMetadataItem.nameSingular,
    recordIndexId,
  );
  if (!currentView) return null;
  return (
    <TimelineView
      key={currentView.id}
      view={currentView}
      objectMetadataItem={objectMetadataItem}
      instanceId={recordIndexId}
      query={query}
      settings={
        <TimelineViewSettings
          view={currentView}
          objectMetadataItem={objectMetadataItem}
          instanceId={recordIndexId}
        />
      }
    />
  );
};
