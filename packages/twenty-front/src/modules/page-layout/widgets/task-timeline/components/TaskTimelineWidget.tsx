import {
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import {
  type TaskTimelineEditInput,
  useTaskTimelineData,
} from '@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData';
import {
  getTaskTimelineCalendarDates,
  getTaskTimelineCalendarSpan,
  getTaskTimelineToday,
  getTaskTimelineVisibleBounds,
  normalizeTaskTimelineDate,
  shiftTaskTimelineDate,
} from '@/page-layout/widgets/task-timeline/utils/getTaskTimelineCalendar';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular, type TaskTimelineItem } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const TASK_TIMELINE_DATE_COLUMN_WIDTH = '7rem';

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
  min-width: 0;
`;

const StyledCalendarViewport = styled.div`
  cursor: grab;
  max-height: 38rem;
  overflow-x: auto;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-gutter: stable;

  &:active {
    cursor: grabbing;
  }
`;

const StyledCalendar = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: grid;
  grid-template-columns: minmax(9rem, 14rem) max-content;
  min-width: 42rem;
  overflow: hidden;
  width: max-content;
`;

const StyledCalendarHeader = styled.div`
  background: ${themeCssVariables.background.transparent.light};
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: minmax(9rem, 14rem) max-content;
`;

const StyledCalendarHeaderTrack = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(
    ${({ $columns }) => $columns},
    ${TASK_TIMELINE_DATE_COLUMN_WIDTH}
  );
`;

const StyledCalendarDate = styled.div`
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  padding: ${themeCssVariables.spacing[2]};
  text-align: center;
`;

const StyledCalendarRow = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: minmax(9rem, 14rem) max-content;
  min-height: 4.5rem;
`;

const StyledCalendarTrack = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(
    ${({ $columns }) => $columns},
    ${TASK_TIMELINE_DATE_COLUMN_WIDTH}
  );
  min-height: 4.5rem;
  position: relative;
`;

const StyledCalendarCell = styled.div`
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  grid-row: 1;
  min-height: 4.5rem;
`;

const StyledTaskChip = styled.div`
  align-self: center;
  background: ${themeCssVariables.background.transparent.light};
  border: 2px solid var(--task-timeline-bar-color);
  border-radius: ${themeCssVariables.border.radius.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin: ${themeCssVariables.spacing[1]};
  overflow-wrap: anywhere;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  z-index: 1;
  position: relative;
  touch-action: none;
`;

const StyledPreviewNotice = styled.span<{ $invalid?: boolean }>`
  background: ${({ $invalid }) =>
    $invalid
      ? themeCssVariables.background.transparent.danger
      : themeCssVariables.background.transparent.light};
  border: 1px dashed ${themeCssVariables.border.color.medium};
  display: block;
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
  padding: 2px ${themeCssVariables.spacing[1]};
`;

const StyledResizeHandle = styled.button`
  background: transparent;
  border: 0;
  cursor: ew-resize;
  height: 100%;
  padding: 0;
  position: absolute;
  top: 0;
  width: 0.75rem;
  z-index: 2;
`;

const StyledLeftResizeHandle = styled(StyledResizeHandle)`
  left: 0;
`;

const StyledRightResizeHandle = styled(StyledResizeHandle)`
  right: 0;
`;

const StyledTaskTitle = styled.strong`
  display: block;
  overflow-wrap: anywhere;
`;

const StyledConflict = styled.span`
  color: ${themeCssVariables.font.color.danger};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const getPreviewDates = (
  item: TaskTimelineItem,
  mode: 'move' | 'start' | 'end',
  dayDelta: number,
): { startDate: string; endDate: string } | null => {
  const startDate = item.startDate?.slice(0, 10);
  const endDate = item.endDate?.slice(0, 10);
  if (!startDate || !endDate) return null;

  return {
    startDate:
      mode === 'end' ? startDate : shiftTaskTimelineDate(startDate, dayDelta),
    endDate:
      mode === 'start' ? endDate : shiftTaskTimelineDate(endDate, dayDelta),
  };
};

const TimelineItems = ({
  items,
  barColor,
  canEditDates,
  updateTask,
}: {
  items: TaskTimelineItem[];
  barColor: string;
  canEditDates: boolean;
  updateTask: (input: TaskTimelineEditInput) => Promise<void>;
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [today, setToday] = useState(() => getTaskTimelineToday());
  const [dragging, setDragging] = useState<{
    item: TaskTimelineItem;
    mode: 'move' | 'start' | 'end';
    originX: number;
    currentX: number;
    dayWidth: number;
    dayDelta: number;
    moved: boolean;
  } | null>(null);
  const [panning, setPanning] = useState(false);
  const panRef = useRef<{
    originX: number;
    originY: number;
    scrollLeft: number;
    scrollTop: number;
    element: HTMLElement;
  } | null>(null);
  const draggedRef = useRef(false);
  const dragCurrentXRef = useRef(0);
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  useEffect(() => {
    const now = new Date();
    const nextLocalMidnight = new Date(now);
    nextLocalMidnight.setHours(24, 0, 0, 0);
    const timeout = window.setTimeout(() => {
      setToday(getTaskTimelineToday());
    }, Math.max(0, nextLocalMidnight.getTime() - now.getTime()));

    return () => window.clearTimeout(timeout);
  }, [today]);

  const normalizedItems = items.map((item) => ({
    ...item,
    startDate: normalizeTaskTimelineDate(item.startDate),
    endDate: normalizeTaskTimelineDate(item.endDate),
  }));
  const datedItems = normalizedItems.filter(
    (item) => item.startDate !== null && item.endDate !== null,
  );
  const visibleItems = datedItems.filter((item) => item.endDate! >= today);
  const previewDates = dragging?.moved
    ? getPreviewDates(dragging.item, dragging.mode, dragging.dayDelta)
    : null;
  const visibleBounds =
    datedItems.length > 0
      ? getTaskTimelineVisibleBounds({
          today,
          taskEndDates: [
            ...visibleItems.map((item) => item.endDate),
            previewDates?.startDate ?? null,
            previewDates?.endDate ?? null,
          ],
        })
      : null;
  const calendarDates = getTaskTimelineCalendarDates(
    visibleBounds?.startDate ?? null,
    visibleBounds?.endDate ?? null,
  );

  useEffect(() => {
    if (dragging === null) return;

    const handlePointerMove = (event: MouseEvent) => {
      dragCurrentXRef.current = event.clientX;
      const dayDelta = Math.round(
        (event.clientX - dragging.originX) / dragging.dayWidth,
      );
      if (dayDelta !== 0) draggedRef.current = true;
      setDragging((current) =>
        current === null
          ? null
          : { ...current, currentX: event.clientX, dayDelta, moved: dayDelta !== 0 },
      );
    };
    const handlePointerUp = () => {
      const dayDelta = Math.round(
        (dragCurrentXRef.current - dragging.originX) / dragging.dayWidth,
      );
      const item = dragging.item;
      const dates = getPreviewDates(item, dragging.mode, dayDelta);
      if (dragging.moved && dates !== null) {
        if (dates.startDate <= dates.endDate) {
          void updateTask({
            taskId: item.id,
            startDate: dates.startDate,
            endDate: dates.endDate,
          }).catch((updateError) =>
            setErrors((current) => ({
              ...current,
              [item.id]:
                updateError instanceof Error
                  ? updateError.message
                  : t`Unable to save task timeline changes.`,
            })),
          );
        } else {
          setErrors((current) => ({
            ...current,
            [item.id]: t`Start date cannot be after due date.`,
          }));
        }
      }
      setDragging(null);
      window.setTimeout(() => {
        draggedRef.current = false;
      }, 0);
    };
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp, { once: true });
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
    };
  }, [dragging, updateTask]);

  useEffect(() => {
    const handlePanMove = (event: MouseEvent) => {
      const pan = panRef.current;
      if (!pan) return;
      pan.element.scrollLeft = pan.scrollLeft - (event.clientX - pan.originX);
      pan.element.scrollTop = pan.scrollTop - (event.clientY - pan.originY);
    };
    const endPan = () => {
      panRef.current = null;
      setPanning(false);
    };
    window.addEventListener('mousemove', handlePanMove);
    window.addEventListener('mouseup', endPan);
    return () => {
      window.removeEventListener('mousemove', handlePanMove);
      window.removeEventListener('mouseup', endPan);
    };
  }, []);

  const beginPan = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || dragging !== null) return;
    const target = event.target as HTMLElement;
    if (
      target.closest(
        '[role="button"], button, input, select, textarea, a, form, [data-pan-ignore="true"]',
      )
    ) {
      return;
    }
    panRef.current = {
      originX: event.clientX,
      originY: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
      element: event.currentTarget,
    };
    setPanning(true);
    event.preventDefault();
  };

  const beginDrag = (
    item: TaskTimelineItem,
    mode: 'move' | 'start' | 'end',
    event: ReactMouseEvent,
  ) => {
    if (!canEditDates || !item.startDate || !item.endDate) return;
    const track = event.currentTarget.closest('[role="gridcell"]');
    const width = track?.getBoundingClientRect().width ?? 0;
    if (width <= 0 || calendarDates.length === 0) return;
    event.preventDefault();
    event.stopPropagation();
    setDragging({
      item,
      mode,
      originX: event.clientX,
      currentX: event.clientX,
      dayWidth: width / calendarDates.length,
      dayDelta: 0,
      moved: false,
    });
    dragCurrentXRef.current = event.clientX;
  };

  const activateTask = (event: ReactMouseEvent, itemId: string) => {
    if (draggedRef.current) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    openRecordInSidePanel({
      recordId: itemId,
      objectNameSingular: CoreObjectNameSingular.Task,
    });
  };

  const activateTaskFromKeyboard = (
    event: KeyboardEvent,
    itemId: string,
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openRecordInSidePanel({
      recordId: itemId,
      objectNameSingular: CoreObjectNameSingular.Task,
    });
  };

  return (
    <StyledTimeline>
      <StyledCalendarViewport
        data-testid="task-timeline-calendar-viewport"
        data-scrollable="horizontal vertical"
        role="region"
        aria-label={t`Task timeline calendar viewport`}
        onMouseDown={beginPan}
        style={{ cursor: panning ? 'grabbing' : undefined }}
      >
        <StyledNotice id="task-timeline-pan-instructions">
          {t`Scroll horizontally and vertically, or drag empty space to pan. Task bars and controls remain interactive.`}
        </StyledNotice>
        {calendarDates.length > 0 && visibleItems.length > 0 && (
        <StyledCalendar
          data-date-column-width={TASK_TIMELINE_DATE_COLUMN_WIDTH}
          role="grid"
          aria-label={t`Task timeline calendar`}
        >
          <StyledCalendarHeader role="row">
            <StyledTaskTitle>{t`Task`}</StyledTaskTitle>
            <StyledCalendarHeaderTrack $columns={calendarDates.length}>
              {calendarDates.map((date) => (
                <StyledCalendarDate key={date} role="columnheader">
                  <time dateTime={date}>{date.slice(5, 10)}</time>
                </StyledCalendarDate>
              ))}
            </StyledCalendarHeaderTrack>
          </StyledCalendarHeader>
          {visibleItems.map((item) => {
            const isPreview = dragging?.item.id === item.id && dragging.moved;
            const itemDates = isPreview
              ? getPreviewDates(item, dragging.mode, dragging.dayDelta)
              : item.startDate && item.endDate
                ? { startDate: item.startDate, endDate: item.endDate }
                : null;
            const isInvalidPreview =
              isPreview &&
              itemDates !== null &&
              itemDates.startDate > itemDates.endDate;
            const visualStartDate = isInvalidPreview
              ? itemDates.startDate < itemDates.endDate
                ? itemDates.startDate
                : itemDates.endDate
              : itemDates?.startDate && itemDates.startDate < today
                ? today
                : itemDates?.startDate ?? null;
            const visualEndDate = isInvalidPreview
              ? itemDates.startDate > itemDates.endDate
                ? itemDates.startDate
                : itemDates.endDate
              : itemDates?.endDate ?? null;
            const span = getTaskTimelineCalendarSpan({
              taskStartDate: visualStartDate,
              taskEndDate: visualEndDate,
              timelineStartDate: visibleBounds!.startDate,
              timelineEndDate: visibleBounds!.endDate,
            });
            if (span === null) return null;
            const conflictId = `timeline-task-conflict-${item.id}`;
            const errorId = `timeline-task-error-${item.id}`;
            const descriptionIds = [
              item.conflict ? conflictId : null,
              errors[item.id] ? errorId : null,
            ].filter((id): id is string => id !== null);
            return (
              <StyledCalendarRow key={item.id} role="row">
                <div>
                   <StyledTaskTitle
                     role="button"
                     tabIndex={0}
                     onClick={(event) => activateTask(event, item.id)}
                     onKeyDown={(event) =>
                       activateTaskFromKeyboard(event, item.id)
                     }
                   >
                    {item.title || t`Untitled task`}
                  </StyledTaskTitle>
                  <StyledNotice>
                    {item.isMilestone ? t`Milestone` : t`Task`}
                  </StyledNotice>
                </div>
                <StyledCalendarTrack
                  $columns={calendarDates.length}
                  role="gridcell"
                >
                  {calendarDates.map((date) => (
                    <StyledCalendarCell key={date} aria-hidden="true" />
                  ))}
                  <StyledTaskChip
                    aria-label={item.title || t`Untitled task`}
                    data-testid={`timeline-task-chip-${item.id}`}
                    role="button"
                    aria-describedby={
                      descriptionIds.length > 0
                        ? descriptionIds.join(' ')
                        : undefined
                    }
                    onClick={(event) => activateTask(event, item.id)}
                    onKeyDown={(event) =>
                      activateTaskFromKeyboard(event, item.id)
                    }
                    onMouseDown={(event) => beginDrag(item, 'move', event)}
                    style={{
                      gridColumn: `${span.startColumn} / span ${span.columnSpan}`,
                      ['--task-timeline-bar-color' as string]: barColor,
                    }}
                    tabIndex={0}
                  >
                    {canEditDates && (
                      <StyledLeftResizeHandle
                        aria-label={t`Resize task start date`}
                        onMouseDown={(event) =>
                          beginDrag(item, 'start', event)
                        }
                        type="button"
                      />
                    )}
                    {item.title || t`Untitled task`}
                    {item.conflict && (
                      <StyledConflict id={conflictId} role="alert">
                        {t`Dependency conflict; dates were not rescheduled.`}
                      </StyledConflict>
                    )}
                    {errors[item.id] && (
                      <StyledConflict id={errorId} role="alert">
                        {errors[item.id]}
                      </StyledConflict>
                    )}
                    {isPreview && itemDates !== null && (
                      <StyledPreviewNotice $invalid={isInvalidPreview}>
                        {t`Preview`} {isInvalidPreview ? t`(invalid)` : ''}: {item.title || t`Untitled task`} ·{' '}
                        {dragging.mode === 'move' ? t`Move` : t`Resize`} · {t`Start`} {itemDates.startDate.slice(5, 10)} ·{' '}
                        {t`Due`} {itemDates.endDate.slice(5, 10)}
                      </StyledPreviewNotice>
                    )}
                    {canEditDates && (
                      <StyledRightResizeHandle
                        aria-label={t`Resize task due date`}
                        onMouseDown={(event) =>
                          beginDrag(item, 'end', event)
                        }
                        type="button"
                      />
                    )}
                  </StyledTaskChip>
                </StyledCalendarTrack>
              </StyledCalendarRow>
            );
          })}
        </StyledCalendar>
        )}
        {datedItems.length === 0 && (
          <StyledState role="status">
            <strong>{t`No dated tasks to display`}</strong>
            <span>{t`Tasks with both a valid start and end date will appear in the calendar.`}</span>
          </StyledState>
        )}
        {datedItems.length > 0 && visibleItems.length === 0 && (
          <StyledState role="status">
            <strong>{t`No active tasks to display`}</strong>
            <span>{t`All dated tasks have already ended.`}</span>
          </StyledState>
        )}
      </StyledCalendarViewport>
    </StyledTimeline>
  );
};

type TaskTimelineWidgetProps = {
  widget: PageLayoutWidget;
};

export const TaskTimelineWidget = ({ widget }: TaskTimelineWidgetProps) => {
  const {
    status,
    items,
    error,
    hasConfigurationGap,
    retry,
    canEditDates = false,
    updateTask = async () => undefined,
  } = useTaskTimelineData(widget);
  const configuredBarColor =
    widget.configuration?.__typename === 'TaskTimelineConfiguration'
      ? widget.configuration.barColor
      : null;
  const barColor = /^#[0-9a-fA-F]{6}$/.test(configuredBarColor ?? '')
    ? configuredBarColor!
    : '#3b82f6';

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
        <span>
          {error?.message ?? t`An error occurred while loading tasks.`}
        </span>
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
        <TimelineItems
          items={items}
          barColor={barColor}
          canEditDates={canEditDates}
          updateTask={updateTask}
        />
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
