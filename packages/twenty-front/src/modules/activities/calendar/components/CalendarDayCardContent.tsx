import { styled } from '@linaria/react';
import { differenceInSeconds, endOfDay, format } from 'date-fns';

import { CalendarEventRow } from '@/activities/calendar/components/CalendarEventRow';
import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';
import { CardContent } from 'twenty-ui/surfaces';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { type TimelineCalendarEvent } from '~/generated/graphql';

type CalendarDayCardContentProps = {
  calendarEvents: TimelineCalendarEvent[];
  divider?: boolean;
};

const StyledCardContentContainer = styled.div`
  > * {
    align-items: flex-start;
    display: flex;
    flex-direction: row;
    gap: ${odelzaThemeCssVariables.spacing[3]};
    padding: ${odelzaThemeCssVariables.spacing[2]}
      ${odelzaThemeCssVariables.spacing[3]};
  }
`;

const StyledDayCardContent = styled(CardContent)`
  @keyframes calendarDayEnded {
    to {
      background-color: ${odelzaThemeCssVariables.background.primary};
    }
  }

  animation: calendarDayEnded calc(var(--odz-animation-duration-fast) * 1s) ease
    forwards;
`;

const StyledDayContainer = styled.div`
  text-align: center;
  width: ${odelzaThemeCssVariables.spacing[6]};
`;

const StyledWeekDay = styled.div`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.xxs};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
`;

const StyledMonthDay = styled.div`
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

const StyledEvents = styled.div`
  align-items: stretch;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledEventRowContainer = styled.div`
  flex: 1 0 auto;
`;

export const CalendarDayCardContent = ({
  calendarEvents,
  divider,
}: CalendarDayCardContentProps) => {
  const endOfDayDate = endOfDay(getCalendarEventStartDate(calendarEvents[0]));
  const dayEndsIn = differenceInSeconds(endOfDayDate, Date.now());

  const weekDayLabel = format(endOfDayDate, 'EE');
  const monthDayLabel = format(endOfDayDate, 'dd');

  return (
    <StyledCardContentContainer>
      <StyledDayCardContent
        divider={divider}
        style={{ animationDelay: `${Math.max(0, dayEndsIn)}s` }}
      >
        <StyledDayContainer>
          <StyledWeekDay>{weekDayLabel}</StyledWeekDay>
          <StyledMonthDay>{monthDayLabel}</StyledMonthDay>
        </StyledDayContainer>
        <StyledEvents>
          {calendarEvents.map((calendarEvent) => (
            <StyledEventRowContainer key={calendarEvent.id}>
              <CalendarEventRow calendarEvent={calendarEvent} />
            </StyledEventRowContainer>
          ))}
        </StyledEvents>
      </StyledDayCardContent>
    </StyledCardContentContainer>
  );
};
