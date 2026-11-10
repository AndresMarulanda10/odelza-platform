import styled from '@emotion/styled';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { CalendarEventTranscriptBody } from 'src/front-components/components/CalendarEventTranscriptBody';
import { useCalendarEventTranscript } from 'src/front-components/hooks/use-calendar-event-transcript';

const StyledTranscriptShell = styled.div`
  background: ${() => odelzaThemeCssVariables.background.primary};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: ${() => odelzaThemeCssVariables.font.family};
  height: 100%;
  padding: ${() => odelzaThemeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledTranscriptHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  height: ${() => odelzaThemeCssVariables.spacing[6]};
`;

const StyledTranscriptTitle = styled.h2`
  color: ${() => odelzaThemeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${() => odelzaThemeCssVariables.font.size.md};
  font-weight: ${() => odelzaThemeCssVariables.font.weight.medium};
  margin: 0;
  overflow: hidden;
  padding-inline: ${() => odelzaThemeCssVariables.spacing[1]};
  user-select: none;
`;

const StyledTranscriptBody = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1;
  margin-top: ${() => odelzaThemeCssVariables.spacing[2]};
  min-height: 0;
`;

const StyledTranscriptContentFrame = styled.div`
  background-color: ${() => odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${() => odelzaThemeCssVariables.border.color.medium};
  border-radius: ${() => odelzaThemeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${() => odelzaThemeCssVariables.spacing[3]};
`;

type CalendarEventTranscriptContentProps = {
  calendarEventId: string;
};

export const CalendarEventTranscriptContent = ({
  calendarEventId,
}: CalendarEventTranscriptContentProps) => {
  const { transcript, isCalendarEventTranscriptQueryLoading, errorMessage } =
    useCalendarEventTranscript(calendarEventId);

  return (
    <StyledTranscriptShell>
      <StyledTranscriptHeader>
        <StyledTranscriptTitle>Transcript</StyledTranscriptTitle>
      </StyledTranscriptHeader>
      <StyledTranscriptBody>
        <StyledTranscriptContentFrame>
          <CalendarEventTranscriptBody
            transcript={transcript}
            isCalendarEventTranscriptQueryLoading={
              isCalendarEventTranscriptQueryLoading
            }
            errorMessage={errorMessage}
          />
        </StyledTranscriptContentFrame>
      </StyledTranscriptBody>
    </StyledTranscriptShell>
  );
};
