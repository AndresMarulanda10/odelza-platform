import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isUndefined } from '@sniptt/guards';

import { CalendarEventNotSharedContent } from '@/activities/calendar/components/CalendarEventNotSharedContent';
import { CalendarEventParticipantsAvatarGroup } from '@/activities/calendar/components/CalendarEventParticipantsAvatarGroup';
import { type CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { useOpenCalendarEventInSidePanel } from '@/side-panel/hooks/useOpenCalendarEventInSidePanel';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { isDefined } from 'twenty-shared/utils';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import {
  formatToHumanReadableDay,
  formatToHumanReadableMonth,
  formatToHumanReadableTime,
} from '~/utils/format/formatDate';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const StyledEventCardCalendarEventContainer = styled.div<{
  canOpen?: boolean;
}>`
  cursor: ${({ canOpen }) => (canOpen ? 'pointer' : 'not-allowed')};
  display: flex;
  flex-direction: row;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledCalendarEventContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: center;
  overflow: hidden;
  width: 100%;
`;

const StyledCalendarEventTop = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: space-between;
  width: 100%;
`;

const StyledCalendarEventTitle = styled.div`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCalendarEventBody = styled.div`
  align-items: flex-start;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};

  justify-content: center;
`;

const StyledCalendarEventDateCard = styled.div`
  align-items: center;
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.spacing[1]};
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[1]};

  justify-content: center;
  padding: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledCalendarEventDateCardMonth = styled.div`
  color: ${odelzaThemeCssVariables.font.color.danger};
  font-size: ${odelzaThemeCssVariables.font.size.xxs};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
`;

const StyledCalendarEventDateCardDay = styled.div`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

export const EventCardCalendarEvent = ({
  calendarEventId,
}: {
  calendarEventId: string;
}) => {
  const { openCalendarEventInSidePanel } = useOpenCalendarEventInSidePanel();

  const {
    record: calendarEvent,
    loading,
    error,
  } = useFindOneRecord<CalendarEvent>({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
    objectRecordId: calendarEventId,
    recordGqlFields: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      calendarEventParticipants: {
        person: true,
        workspaceMember: true,
        handle: true,
        displayName: true,
      },
    },
  });

  const { timeZone } = useContext(UserContext);

  if (isDefined(error)) {
    if (CombinedGraphQLErrors.is(error)) {
      const shouldHideMessageContent = error.errors.some(
        (e) => e.extensions?.code === 'FORBIDDEN',
      );

      if (shouldHideMessageContent) {
        return <CalendarEventNotSharedContent />;
      }

      const shouldHandleNotFound = error.errors.some(
        (e) => e.extensions?.code === 'NOT_FOUND',
      );

      if (shouldHandleNotFound) {
        return <div>{t`Calendar event not found`}</div>;
      }
    }

    return <div>{t`Error loading calendar event`}</div>;
  }

  if (loading || isUndefined(calendarEvent)) {
    return <div>{t`Loading...`}</div>;
  }

  const startsAtDate = calendarEvent?.startsAt;
  const endsAtDate = calendarEvent?.endsAt;

  if (isUndefinedOrNull(startsAtDate)) {
    throw new Error("Can't render a calendarEvent without a start date");
  }

  const startsAtMonth = formatToHumanReadableMonth(startsAtDate, timeZone);

  const startsAtDay = formatToHumanReadableDay(startsAtDate, timeZone);

  const startsAtHour = formatToHumanReadableTime(startsAtDate, timeZone);
  const endsAtHour = endsAtDate
    ? formatToHumanReadableTime(endsAtDate, timeZone)
    : null;

  const canOpen =
    calendarEvent.title !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

  const handleClick = () => {
    if (canOpen) {
      openCalendarEventInSidePanel(calendarEventId);
    }
  };

  return (
    <StyledEventCardCalendarEventContainer
      onClick={handleClick}
      canOpen={canOpen}
    >
      <StyledCalendarEventDateCard>
        <StyledCalendarEventDateCardMonth>
          {startsAtMonth}
        </StyledCalendarEventDateCardMonth>
        <StyledCalendarEventDateCardDay>
          {startsAtDay}
        </StyledCalendarEventDateCardDay>
      </StyledCalendarEventDateCard>
      <StyledCalendarEventContent>
        <StyledCalendarEventTop>
          {calendarEvent.title ===
          FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED ? (
            <CalendarEventNotSharedContent />
          ) : (
            <StyledCalendarEventTitle>
              {calendarEvent.title}
            </StyledCalendarEventTitle>
          )}
          {!!calendarEvent.calendarEventParticipants?.length && (
            <CalendarEventParticipantsAvatarGroup
              participants={calendarEvent.calendarEventParticipants}
            />
          )}
        </StyledCalendarEventTop>

        <StyledCalendarEventBody>
          {startsAtHour} {endsAtHour && <>→ {endsAtHour}</>}
        </StyledCalendarEventBody>
      </StyledCalendarEventContent>
    </StyledEventCardCalendarEventContainer>
  );
};
