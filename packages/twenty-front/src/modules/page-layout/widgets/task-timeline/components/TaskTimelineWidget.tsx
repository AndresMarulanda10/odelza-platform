import {
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
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
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { DEFAULT_TASK_TIMELINE_BAR_COLOR } from 'twenty-shared/constants';
import {
  CoreObjectNameSingular,
  type TaskTimelineItem,
} from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';

const TASK_TIMELINE_DATE_COLUMN_WIDTH = '7rem';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const StyledState = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  height: 100%;
  justify-content: safe center;
  min-height: 0;
  overflow: auto;
  overflow-wrap: anywhere;
  text-align: center;
`;

const StyledNotice = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
`;

const StyledHelpBar = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
`;

const StyledIdentifier = styled.div`
  background: ${themeCssVariables.background.primary};
  box-sizing: border-box;
  left: 0;
  padding: ${themeCssVariables.spacing[2]};
  position: sticky;
  z-index: 2;
`;

const StyledCorner = styled(StyledIdentifier)`
  z-index: 4;
`;

const StyledTimeline = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 0;
  min-width: 0;
`;

const StyledCalendarViewport = styled.div`
  container-name: task-timeline-calendar;
  container-type: size;
  cursor: grab;
  flex: 1;
  min-height: 0;
  min-width: 0;
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
  width: max-content;
`;

const StyledCalendarHeader = styled.div`
  background: ${themeCssVariables.background.primary};
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: minmax(9rem, 14rem) max-content;
  position: sticky;
  top: 0;
  z-index: 3;

  /* A short viewport must let its header scroll away to expose record rows. */
  @container task-timeline-calendar (max-height: 6rem) {
    position: relative;
    top: auto;
  }
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
  min-height: 3rem;
`;

const StyledCalendarTrack = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(
    ${({ $columns }) => $columns},
    ${TASK_TIMELINE_DATE_COLUMN_WIDTH}
  );
  min-height: 3rem;
  position: relative;
`;

const StyledCalendarCell = styled.div`
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  grid-row: 1;
  min-height: 3rem;
`;

const StyledTaskChip = styled.div`
  align-self: center;
  background: ${themeCssVariables.background.transparent.light};
  border: 2px solid var(--task-timeline-bar-color);
  border-radius: ${themeCssVariables.border.radius.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  grid-row: 1;
  margin: ${themeCssVariables.spacing[1]};
  overflow-wrap: anywhere;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  position: relative;
  touch-action: none;
  z-index: 1;
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
  objectNameSingular,
  objectLabelSingular,
}: {
  items: TaskTimelineItem[];
  barColor: string;
  canEditDates: boolean;
  updateTask: (input: TaskTimelineEditInput) => Promise<void>;
  objectNameSingular: string;
  objectLabelSingular: string;
}) => {
  const isTask = objectNameSingular === CoreObjectNameSingular.Task;
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
  const [pan, setPan] = useState<{
    originX: number;
    originY: number;
    scrollLeft: number;
    scrollTop: number;
    element: HTMLElement;
  } | null>(null);
  const [dragged, setDragged] = useState(false);
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  useEffect(() => {
    const now = new Date();
    const nextLocalMidnight = new Date(now);
    nextLocalMidnight.setHours(24, 0, 0, 0);
    const timeout = window.setTimeout(
      () => {
        setToday(getTaskTimelineToday());
      },
      Math.max(0, nextLocalMidnight.getTime() - now.getTime()),
    );

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
      const dayDelta = Math.round(
        (event.clientX - dragging.originX) / dragging.dayWidth,
      );
      if (dayDelta !== 0) setDragged(true);
      setDragging((current) =>
        current === null
          ? null
          : {
              ...current,
              currentX: event.clientX,
              dayDelta,
              moved: dayDelta !== 0,
            },
      );
    };
    const handlePointerUp = () => {
      const dayDelta = Math.round(
        (dragging.currentX - dragging.originX) / dragging.dayWidth,
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
                  : t`Unable to save timeline changes.`,
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
        setDragged(false);
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
    if (pan === null) return;

    const handlePanMove = (event: MouseEvent) => {
      pan.element.scrollLeft = pan.scrollLeft - (event.clientX - pan.originX);
      pan.element.scrollTop = pan.scrollTop - (event.clientY - pan.originY);
    };
    const endPan = () => {
      setPan(null);
    };
    window.addEventListener('mousemove', handlePanMove);
    window.addEventListener('mouseup', endPan);
    return () => {
      window.removeEventListener('mousemove', handlePanMove);
      window.removeEventListener('mouseup', endPan);
    };
  }, [pan]);

  const beginPan = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.button !== 0 || dragging !== null) return;
    const target = event.target as HTMLElement;
    if (
      target.closest(
        '[role="button"], button, input, select, textarea, a, form, [data-pan-ignore="true"]',
      )
    ) {
      return;
    }
    setPan({
      originX: event.clientX,
      originY: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
      element: event.currentTarget,
    });
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
  };

  const activateTask = (event: ReactMouseEvent, itemId: string) => {
    if (dragged) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    openRecordInSidePanel({
      recordId: itemId,
      objectNameSingular,
    });
  };

  const activateTaskFromKeyboard = (event: KeyboardEvent, itemId: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openRecordInSidePanel({
      recordId: itemId,
      objectNameSingular,
    });
  };

  return (
    <StyledTimeline>
      <StyledCalendarViewport
        data-testid="task-timeline-calendar-viewport"
        data-scrollable="horizontal vertical"
        role="region"
        aria-label={
          objectNameSingular === 'task'
            ? t`Task timeline calendar viewport`
            : t`Timeline calendar viewport`
        }
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const delta = {
            ArrowLeft: [-112, 0],
            ArrowRight: [112, 0],
            ArrowUp: [0, -48],
            ArrowDown: [0, 48],
          }[event.key];
          if (!delta) return;
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.scrollLeft += delta[0];
          event.currentTarget.scrollTop += delta[1];
        }}
        onMouseDown={beginPan}
        style={{ cursor: pan !== null ? 'grabbing' : undefined }}
      >
        {calendarDates.length > 0 && visibleItems.length > 0 && (
          <StyledCalendar
            data-date-column-width={TASK_TIMELINE_DATE_COLUMN_WIDTH}
            role="grid"
            aria-label={
              objectNameSingular === 'task'
                ? t`Task timeline calendar`
                : t`Timeline calendar`
            }
          >
            <StyledCalendarHeader role="row">
              <StyledCorner>
                <StyledTaskTitle>{objectLabelSingular}</StyledTaskTitle>
              </StyledCorner>
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
                  : (itemDates?.startDate ?? null);
              const visualEndDate = isInvalidPreview
                ? itemDates.startDate > itemDates.endDate
                  ? itemDates.startDate
                  : itemDates.endDate
                : (itemDates?.endDate ?? null);
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
                  <StyledIdentifier>
                    <StyledTaskTitle
                      role="button"
                      tabIndex={0}
                      onClick={(event) => activateTask(event, item.id)}
                      onKeyDown={(event) =>
                        activateTaskFromKeyboard(event, item.id)
                      }
                    >
                      {item.title || objectLabelSingular}
                    </StyledTaskTitle>
                    <StyledNotice>
                      {item.isMilestone ? t`Milestone` : objectLabelSingular}
                    </StyledNotice>
                  </StyledIdentifier>
                  <StyledCalendarTrack
                    $columns={calendarDates.length}
                    role="gridcell"
                  >
                    {calendarDates.map((date, index) => (
                      <StyledCalendarCell
                        key={date}
                        aria-hidden="true"
                        style={{ gridColumn: index + 1 }}
                      />
                    ))}
                    <StyledTaskChip
                      aria-label={item.title || objectLabelSingular}
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
                          aria-label={
                            isTask
                              ? t`Resize task start date`
                              : t`Resize record start date`
                          }
                          onMouseDown={(event) =>
                            beginDrag(item, 'start', event)
                          }
                          type="button"
                        />
                      )}
                      {item.title || objectLabelSingular}
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
                          {t`Preview`} {isInvalidPreview ? t`(invalid)` : ''}:{' '}
                          {item.title || objectLabelSingular} ·{' '}
                          {dragging.mode === 'move' ? t`Move` : t`Resize`} ·{' '}
                          {t`Start`} {itemDates.startDate.slice(5, 10)} ·{' '}
                          {t`Due`} {itemDates.endDate.slice(5, 10)}
                        </StyledPreviewNotice>
                      )}
                      {canEditDates && (
                        <StyledRightResizeHandle
                          aria-label={
                            isTask
                              ? t`Resize task due date`
                              : t`Resize record end date`
                          }
                          onMouseDown={(event) => beginDrag(item, 'end', event)}
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
            <strong>
              {isTask
                ? t`No dated tasks to display`
                : t`No dated records to display`}
            </strong>
            <span>{t`Records with both a valid start and end date will appear in the calendar.`}</span>
          </StyledState>
        )}
        {datedItems.length > 0 && visibleItems.length === 0 && (
          <StyledState role="status">
            <strong>
              {isTask
                ? t`No active tasks to display`
                : t`No active records to display`}
            </strong>
            <span>{t`All dated records have already ended.`}</span>
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
  const { objectMetadataItems } = useObjectMetadataItems();
  if (objectMetadataItems.length === 0) {
    return (
      <StyledState role="status">{t`Select a source and configure timeline date fields.`}</StyledState>
    );
  }
  return <TaskTimelineWidgetContent widget={widget} />;
};

const TaskTimelineWidgetContent = ({ widget }: TaskTimelineWidgetProps) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const {
    status,
    items,
    error,
    hasConfigurationGap,
    configurationReason,
    retry,
    canEditDates = false,
    updateTask = async () => undefined,
    objectNameSingular = CoreObjectNameSingular.Task,
    objectLabelSingular = t`Task`,
  } = useTaskTimelineData(widget);
  const isTask = objectNameSingular === CoreObjectNameSingular.Task;
  const configuredBarColor =
    widget.configuration?.__typename === 'TaskTimelineConfiguration'
      ? widget.configuration.barColor
      : null;
  const barColor = /^#[0-9a-fA-F]{6}$/.test(configuredBarColor ?? '')
    ? configuredBarColor!
    : DEFAULT_TASK_TIMELINE_BAR_COLOR;

  if (status === 'loading') {
    return <WidgetSkeletonLoader />;
  }

  if (status === 'forbidden') {
    return (
      <StyledState role="alert">
        <strong>
          {isTask ? t`Task timeline unavailable` : t`Timeline unavailable`}
        </strong>
        <span>
          {isTask
            ? t`You do not have permission to view task data.`
            : t`You do not have permission to view source data.`}
        </span>
      </StyledState>
    );
  }

  if (status === 'error') {
    return (
      <StyledState role="alert">
        <strong>
          {isTask
            ? t`Unable to load task timeline`
            : t`Unable to load timeline`}
        </strong>
        <span>
          {error?.message ?? t`An error occurred while loading records.`}
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
        <strong>
          {isTask ? t`No tasks to display` : t`No records to display`}
        </strong>
        <span>{t`Records with configured start and end dates will appear here.`}</span>
      </StyledState>
    );
  }

  return (
    <StyledContainer
      role="region"
      aria-label={isTask ? t`Task timeline` : t`Timeline`}
    >
      <StyledHelpBar>
        <button
          type="button"
          data-tooltip-id={`${widget.id}-timeline-help`}
          aria-label={t`Timeline help`}
          aria-describedby={
            helpOpen ? `${widget.id}-timeline-help-content` : undefined
          }
          onMouseDown={(event) => event.stopPropagation()}
          onFocus={() => setHelpOpen(true)}
          onBlur={() => setHelpOpen(false)}
          onClick={() => setHelpOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setHelpOpen(false);
          }}
        >
          {t`Help`}
        </button>
        <AppTooltip
          anchorSelect={`[data-tooltip-id="${widget.id}-timeline-help"]`}
          delay={TooltipDelay.noDelay}
          isOpen={helpOpen}
        >
          <span role="tooltip" id={`${widget.id}-timeline-help-content`}>
            {`${
              isTask
                ? t`Dates are full-day and inclusive. Finish-to-start conflicts remain visible without automatic rescheduling.`
                : t`Dates are full-day and inclusive. Dependencies and status are not interpreted for this source.`
            } ${t`Scroll horizontally and vertically, or drag empty space to pan. Record bars and controls remain interactive.`}`}
          </span>
        </AppTooltip>
      </StyledHelpBar>
      {hasConfigurationGap && (
        <StyledNotice>
          {configurationReason === 'invalid-date-mapping'
            ? isTask
              ? t`Configured task date fields are invalid or no longer available. Update the widget field mappings.`
              : t`Configured date fields are invalid or no longer available. Update the widget field mappings.`
            : hasConfigurationGap
              ? t`Choose an active source and configure readable date fields; unavailable dates are not inferred.`
              : isTask
                ? t`Dates are full-day and inclusive. Finish-to-start conflicts remain visible without automatic rescheduling.`
                : t`Dates are full-day and inclusive. Dependencies and status are not interpreted for this source.`}
        </StyledNotice>
      )}
      {items.length > 0 ? (
        <TimelineItems
          items={items}
          barColor={barColor}
          canEditDates={canEditDates}
          updateTask={updateTask}
          objectNameSingular={objectNameSingular}
          objectLabelSingular={objectLabelSingular}
        />
      ) : (
        <StyledState role="status">
          <strong>{t`Timeline data is incomplete`}</strong>
          <span>{t`Unavailable record data is not shown as zero or an invented date.`}</span>
        </StyledState>
      )}
      {status === 'partial' && items.length > 0 && (
        <StyledNotice role="status">
          {error
            ? t`Some record data could not be loaded.`
            : t`Some records have unavailable dates or progress.`}
        </StyledNotice>
      )}
    </StyledContainer>
  );
};
