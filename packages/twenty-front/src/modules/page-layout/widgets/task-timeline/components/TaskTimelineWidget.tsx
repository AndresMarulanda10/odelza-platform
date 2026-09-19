import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useTaskTimelineData } from '@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type TaskTimelineItem } from 'twenty-shared/types';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledState = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  min-height: 120px;
  text-align: center;
`;

const StyledNotice = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  overflow-x: auto;
`;

const StyledTask = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: minmax(9rem, 1fr) minmax(12rem, 2fr);
  padding: ${themeCssVariables.spacing[2]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledTaskTitle = styled.strong`
  display: block;
  overflow-wrap: anywhere;
`;

const StyledTaskDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledProgress = styled.progress`
  width: 100%;
`;

const StyledConflict = styled.span`
  color: ${themeCssVariables.font.color.danger};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const TimelineItems = ({ items }: { items: TaskTimelineItem[] }) => (
  <StyledTimeline role="list" aria-label={t`Task timeline items`}>
    {items.map((item) => (
      <StyledTask
        key={item.id}
        role="listitem"
        tabIndex={0}
        aria-label={item.title || t`Untitled task`}
      >
        <div>
          <StyledTaskTitle>{item.title || t`Untitled task`}</StyledTaskTitle>
          <StyledNotice>{item.isMilestone ? t`Milestone` : t`Task`}</StyledNotice>
        </div>
        <StyledTaskDetails>
          <span>
            <time dateTime={item.startDate ?? undefined}>
              {item.startDate ?? t`Start date unavailable`}
            </time>{' '}
            –{' '}
            <time dateTime={item.endDate ?? undefined}>
              {item.endDate ?? t`End date unavailable`}
            </time>
          </span>
          {item.progress === null ? (
            <StyledNotice>{t`Progress unavailable`}</StyledNotice>
          ) : (
            <StyledProgress
              max={100}
              value={item.progress}
              aria-label={t`${item.title || 'Task'} progress`}
            />
          )}
          {item.dependencies.length > 0 && (
            <StyledNotice>
              {t`Finish-to-start dependency`} ({item.dependencies.length})
            </StyledNotice>
          )}
          {item.conflict && (
            <StyledConflict role="alert">
              {t`Dependency conflict; dates were not rescheduled.`}
            </StyledConflict>
          )}
        </StyledTaskDetails>
      </StyledTask>
    ))}
  </StyledTimeline>
);

type TaskTimelineWidgetProps = {
  widget: PageLayoutWidget;
};

export const TaskTimelineWidget = ({ widget }: TaskTimelineWidgetProps) => {
  const { status, items, error, hasConfigurationGap, retry } =
    useTaskTimelineData(widget);

  if (status === 'loading') {
    return <WidgetSkeletonLoader />;
  }

  if (status === 'forbidden') {
    return (
      <StyledState role="alert">
        <strong>{t`Task timeline unavailable`}</strong>
        <span>{t`You do not have permission to view task data.`}</span>
      </StyledState>
    );
  }

  if (status === 'error') {
    return (
      <StyledState role="alert">
        <strong>{t`Unable to load task timeline`}</strong>
        <span>{error?.message ?? t`An error occurred while loading tasks.`}</span>
        <button type="button" onClick={retry}>
          {t`Retry`}
        </button>
      </StyledState>
    );
  }

  if (status === 'empty') {
    return (
      <StyledState role="status">
        <strong>{t`No tasks to display`}</strong>
        <span>{t`Tasks with approved start and end dates will appear here.`}</span>
      </StyledState>
    );
  }

  return (
    <StyledContainer
      role="region"
      aria-label={t`Task timeline`}
      aria-describedby={`${widget.id}-timeline-description`}
    >
      <StyledNotice id={`${widget.id}-timeline-description`}>
        {hasConfigurationGap
          ? t`Task date fields are not configured; unavailable dates are not inferred.`
          : t`Dates are full-day and inclusive. Finish-to-start conflicts remain visible without automatic rescheduling.`}
      </StyledNotice>
      {items.length > 0 ? (
        <TimelineItems items={items} />
      ) : (
        <StyledState role="status">
          <strong>{t`Timeline data is incomplete`}</strong>
          <span>{t`Unavailable task data is not shown as zero or an invented date.`}</span>
        </StyledState>
      )}
      {status === 'partial' && items.length > 0 && (
        <StyledNotice role="status">
          {error
            ? t`Some task data could not be loaded.`
            : t`Some tasks have unavailable dates or progress.`}
        </StyledNotice>
      )}
    </StyledContainer>
  );
};
