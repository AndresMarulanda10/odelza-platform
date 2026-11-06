import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { format } from 'date-fns';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  CalendarChannelVisibility,
  type TimelineCalendarEvent,
} from '~/generated/graphql';

import { CalendarEventNotSharedContent } from '@/activities/calendar/components/CalendarEventNotSharedContent';
import { CalendarEventParticipantsAvatarGroup } from '@/activities/calendar/components/CalendarEventParticipantsAvatarGroup';
import { getCalendarEventEndDate } from '@/activities/calendar/utils/getCalendarEventEndDate';
import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';
import { hasCalendarEventEnded } from '@/activities/calendar/utils/hasCalendarEventEnded';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useOpenCalendarEventInSidePanel } from '@/side-panel/hooks/useOpenCalendarEventInSidePanel';
import { useContext } from 'react';
import { IconArrowRight } from 'twenty-ui/icon';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

type CalendarEventRowProps = {
  calendarEvent: TimelineCalendarEvent;
  className?: string;
};

const StyledContainer = styled.div<{ showTitle?: boolean }>`
  align-items: center;
  cursor: ${({ showTitle }) => (showTitle ? 'pointer' : 'not-allowed')};
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[3]};
  height: ${odelzaThemeCssVariables.spacing[6]};
  position: relative;
`;

const StyledAttendanceIndicator = styled.div<{ active?: boolean }>`
  background-color: ${({ active }) =>
    active
      ? odelzaThemeCssVariables.tag.background.red
      : odelzaThemeCssVariables.tag.background.gray};
  border-radius: ${odelzaThemeCssVariables.border.radius.xs};
  height: 100%;
  width: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledLabels = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.primary};
  display: flex;
  flex: 1 0 auto;
  gap: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledTime = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  width: ${odelzaThemeCssVariables.spacing[26]};
`;

const StyledTitle = styled.div<{ active: boolean; canceled: boolean }>`
  color: ${({ active }) =>
    active ? odelzaThemeCssVariables.font.color.primary : 'inherit'};
  flex: 1 0 auto;
  font-weight: ${({ active }) =>
    active ? odelzaThemeCssVariables.font.weight.medium : 'inherit'};
  overflow: hidden;
  text-decoration: ${({ canceled }) => (canceled ? 'line-through' : 'none')};
  text-overflow: ellipsis;
  white-space: nowrap;
  width: ${odelzaThemeCssVariables.spacing[10]};
`;

export const CalendarEventRow = ({
  calendarEvent,
  className,
}: CalendarEventRowProps) => {
  const { theme } = useContext(ThemeContext);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { openCalendarEventInSidePanel } = useOpenCalendarEventInSidePanel();

  const startsAt = getCalendarEventStartDate(calendarEvent);
  const endsAt = getCalendarEventEndDate(calendarEvent);
  const hasEnded = hasCalendarEventEnded(calendarEvent);

  const startTimeLabel = calendarEvent.isFullDay
    ? t`All day`
    : format(startsAt, 'HH:mm');
  const endTimeLabel = calendarEvent.isFullDay ? '' : format(endsAt, 'HH:mm');

  const isCurrentWorkspaceMemberAttending = calendarEvent.participants?.some(
    ({ workspaceMemberId }) => workspaceMemberId === currentWorkspaceMember?.id,
  );
  const showTitle =
    calendarEvent.visibility === CalendarChannelVisibility.SHARE_EVERYTHING;

  return (
    <StyledContainer
      className={className}
      showTitle={showTitle}
      onClick={
        showTitle
          ? () => {
              openCalendarEventInSidePanel(calendarEvent.id);
            }
          : undefined
      }
    >
      <StyledAttendanceIndicator active={isCurrentWorkspaceMemberAttending} />
      <StyledLabels>
        <StyledTime>
          {startTimeLabel}
          {endTimeLabel && (
            <>
              <IconArrowRight size={theme.icon.size.sm} />
              {endTimeLabel}
            </>
          )}
        </StyledTime>
        {showTitle ? (
          <StyledTitle active={!hasEnded} canceled={!!calendarEvent.isCanceled}>
            {calendarEvent.title}
          </StyledTitle>
        ) : (
          <CalendarEventNotSharedContent />
        )}
      </StyledLabels>
      {!!calendarEvent.participants?.length && (
        <CalendarEventParticipantsAvatarGroup
          participants={calendarEvent.participants}
        />
      )}
    </StyledContainer>
  );
};
