import { styled } from '@linaria/react';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { EventList } from '@/activities/timeline-activities/components/EventList';
import { useTimelineActivities } from '@/activities/timeline-activities/hooks/useTimelineActivities';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/feedback';
import {
  MOBILE_VIEWPORT,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledMainContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  border-top: none;
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[4]};

  justify-content: center;
  overflow: auto;
  padding-left: ${odelzaThemeCssVariables.spacing[6]};
  padding-right: ${odelzaThemeCssVariables.spacing[6]};
  padding-top: ${odelzaThemeCssVariables.spacing[6]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-top: 1px solid ${odelzaThemeCssVariables.border.color.medium};
    padding-right: ${odelzaThemeCssVariables.spacing[1]};
    padding-left: ${odelzaThemeCssVariables.spacing[1]};
  }
`;

const StyledSidePanelPlaceholderWrapper = styled.div`
  > * {
    height: auto;
    padding-top: ${odelzaThemeCssVariables.spacing[8]};
  }
`;

export const TimelineCard = () => {
  const targetRecord = useTargetRecord();
  const { isInSidePanel } = useLayoutRenderingContext();
  const {
    timelineActivities,
    firstQueryLoading,
    loadingMore,
    fetchMoreRecords,
  } = useTimelineActivities(targetRecord);

  const isTimelineActivitiesEmpty = timelineActivities.length === 0;

  if (firstQueryLoading === true) {
    return <SkeletonLoader withSubSections />;
  }

  if (isTimelineActivitiesEmpty) {
    const placeholderContent = (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="emptyTimeline" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`No activity yet`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`There is no activity associated with this record.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );

    return isInSidePanel ? (
      <StyledSidePanelPlaceholderWrapper>
        {placeholderContent}
      </StyledSidePanelPlaceholderWrapper>
    ) : (
      placeholderContent
    );
  }

  return (
    <StyledMainContainer>
      <EventList
        targetableObject={targetRecord}
        title={t`All`}
        events={timelineActivities ?? []}
      />
      <CustomResolverFetchMoreLoader
        loading={loadingMore}
        onLastRowVisible={fetchMoreRecords}
      />
    </StyledMainContainer>
  );
};
