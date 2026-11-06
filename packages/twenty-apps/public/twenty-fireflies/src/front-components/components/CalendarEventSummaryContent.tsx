import styled from '@emotion/styled';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { CalendarEventSummaryBody } from 'src/front-components/components/CalendarEventSummaryBody';
import { useCalendarEventSummary } from 'src/front-components/hooks/use-calendar-event-summary';

const StyledSummaryShell = styled.div`
  background: ${() => odelzaThemeCssVariables.background.primary};
  border: 1px solid transparent;
  border-radius: ${() => odelzaThemeCssVariables.border.radius.md};
  box-sizing: border-box;
  font-family: ${() => odelzaThemeCssVariables.font.family};
  padding: ${() => odelzaThemeCssVariables.spacing[4]};
  position: relative;
  width: 100%;
`;

const StyledSummaryHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  height: ${() => odelzaThemeCssVariables.spacing[6]};
`;

const StyledSummaryTitle = styled.h2`
  color: ${() => odelzaThemeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${() => odelzaThemeCssVariables.font.size.md};
  font-weight: ${() => odelzaThemeCssVariables.font.weight.medium};
  margin: 0;
  overflow: hidden;
  padding-inline: ${() => odelzaThemeCssVariables.spacing[1]};
  user-select: none;
`;

const StyledSummaryBody = styled.div`
  box-sizing: border-box;
  margin-top: ${() => odelzaThemeCssVariables.spacing[2]};
`;

const StyledSummaryContentFrame = styled.div`
  background-color: ${() => odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${() => odelzaThemeCssVariables.border.color.medium};
  border-radius: ${() => odelzaThemeCssVariables.border.radius.md};
  box-sizing: border-box;
  padding: ${() => odelzaThemeCssVariables.spacing[3]};
`;

type CalendarEventSummaryContentProps = {
  calendarEventId: string;
};

export const CalendarEventSummaryContent = ({
  calendarEventId,
}: CalendarEventSummaryContentProps) => {
  const { summaryMarkdown, isCalendarEventSummaryQueryLoading, errorMessage } =
    useCalendarEventSummary(calendarEventId);

  return (
    <StyledSummaryShell>
      <StyledSummaryHeader>
        <StyledSummaryTitle>Summary</StyledSummaryTitle>
      </StyledSummaryHeader>
      <StyledSummaryBody>
        <StyledSummaryContentFrame>
          <CalendarEventSummaryBody
            summaryMarkdown={summaryMarkdown}
            isCalendarEventSummaryQueryLoading={
              isCalendarEventSummaryQueryLoading
            }
            errorMessage={errorMessage}
          />
        </StyledSummaryContentFrame>
      </StyledSummaryBody>
    </StyledSummaryShell>
  );
};
