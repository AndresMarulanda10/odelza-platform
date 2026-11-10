import styled from '@emotion/styled';
import { useState } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { CalendarEventRecordingBody } from 'src/front-components/components/CalendarEventRecordingBody';
import { useCalendarEventParticipants } from 'src/front-components/hooks/use-calendar-event-participants';
import { useCalendarEventRecording } from 'src/front-components/hooks/use-calendar-event-recording';

const TRANSCRIPT_TIME_UPDATE_INTERVAL_SECONDS = 0.25;

const StyledRecordingShell = styled.div`
  background: ${() => odelzaThemeCssVariables.background.primary};
  border: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-radius: ${() => odelzaThemeCssVariables.border.radius.md};
  box-sizing: border-box;
  font-family: ${() => odelzaThemeCssVariables.font.family};
  padding: ${() => odelzaThemeCssVariables.spacing[4]};
  position: relative;
  width: 100%;
`;

const StyledRecordingHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  height: ${() => odelzaThemeCssVariables.spacing[6]};
`;

const StyledRecordingTitle = styled.h2`
  color: ${() => odelzaThemeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${() => odelzaThemeCssVariables.font.size.md};
  font-weight: ${() => odelzaThemeCssVariables.font.weight.medium};
  margin: 0;
  overflow: hidden;
  padding-inline: ${() => odelzaThemeCssVariables.spacing[1]};
  user-select: none;
`;

const StyledRecordingBody = styled.div`
  box-sizing: border-box;
  margin-top: ${() => odelzaThemeCssVariables.spacing[2]};
`;

const StyledRecordingContentFrame = styled.div`
  background-color: ${() => odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${() => odelzaThemeCssVariables.border.color.medium};
  border-radius: ${() => odelzaThemeCssVariables.border.radius.md};
  box-sizing: border-box;
  padding: ${() => odelzaThemeCssVariables.spacing[2]};
`;

type CalendarEventRecordingContentProps = {
  calendarEventId: string;
};

export const CalendarEventRecordingContent = ({
  calendarEventId,
}: CalendarEventRecordingContentProps) => {
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);

  const updateCurrentTimeSeconds = (videoCurrentTimeSeconds: number) => {
    const nextCurrentTimeSeconds =
      Math.floor(
        videoCurrentTimeSeconds / TRANSCRIPT_TIME_UPDATE_INTERVAL_SECONDS,
      ) * TRANSCRIPT_TIME_UPDATE_INTERVAL_SECONDS;

    setCurrentTimeSeconds((previousCurrentTimeSeconds) =>
      previousCurrentTimeSeconds === nextCurrentTimeSeconds
        ? previousCurrentTimeSeconds
        : nextCurrentTimeSeconds,
    );
  };

  const {
    transcript,
    videoFile,
    isCalendarEventRecordingQueryLoading,
    errorMessage,
    refetchCalendarEventRecording,
  } = useCalendarEventRecording(calendarEventId);
  const { calendarEventParticipants } =
    useCalendarEventParticipants(calendarEventId);

  const handleVideoRetry = () => {
    setCurrentTimeSeconds(0);
    refetchCalendarEventRecording();
  };

  const videoFileUrl = videoFile?.url ?? undefined;

  return (
    <StyledRecordingShell>
      <StyledRecordingHeader>
        <StyledRecordingTitle>Recording and Transcript</StyledRecordingTitle>
      </StyledRecordingHeader>
      <StyledRecordingBody>
        <StyledRecordingContentFrame>
          <CalendarEventRecordingBody
            transcript={transcript}
            videoFileUrl={videoFileUrl}
            isCalendarEventRecordingQueryLoading={
              isCalendarEventRecordingQueryLoading
            }
            errorMessage={errorMessage}
            currentTimeSeconds={currentTimeSeconds}
            calendarEventParticipants={calendarEventParticipants}
            onVideoTimeUpdate={updateCurrentTimeSeconds}
            onVideoRetry={handleVideoRetry}
          />
        </StyledRecordingContentFrame>
      </StyledRecordingBody>
    </StyledRecordingShell>
  );
};
