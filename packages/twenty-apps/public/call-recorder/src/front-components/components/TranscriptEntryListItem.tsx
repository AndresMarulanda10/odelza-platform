import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { Avatar, Chip, ChipVariant } from 'twenty-ui/data-display';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';
import {
  type TranscriptEntry,
  type TranscriptWord,
} from 'src/front-components/types/transcript-entry.type';
import { formatSecondsAsClockTimestamp } from 'src/logic-functions/utils/format-seconds-as-clock-timestamp.util';

const StyledEntry = styled.div<{ $isActive: boolean }>`
  align-items: flex-start;
  background: ${({ $isActive }) =>
    $isActive
      ? odelzaThemeCssVariables.background.transparent.accent
      : 'transparent'};
  border-radius: ${() => odelzaThemeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => odelzaThemeCssVariables.spacing[2]};
  justify-content: center;
  padding: ${() => odelzaThemeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledEntryHeader = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${() => odelzaThemeCssVariables.spacing[2]};
  min-height: ${() => odelzaThemeCssVariables.spacing[6]};
  min-width: 0;
`;

const StyledTimestamp = styled.span`
  color: ${() => odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${() => odelzaThemeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledEntryText = styled.p`
  align-self: stretch;
  color: ${() => odelzaThemeCssVariables.font.color.secondary};
  font-size: ${() => odelzaThemeCssVariables.font.size.sm};
  line-height: 1.4;
  margin: 0;
`;

const StyledWord = styled.span<{ $isSpoken: boolean }>`
  color: ${({ $isSpoken }) =>
    $isSpoken
      ? odelzaThemeCssVariables.font.color.primary
      : odelzaThemeCssVariables.font.color.secondary};
  line-height: 1.4;
  transition: color 0.15s ease;
`;

type TranscriptEntryListItemProps = {
  entry: TranscriptEntry;
  isActive: boolean;
  currentTimeSeconds: number;
  calendarEventParticipant: CalendarEventRecordingParticipant | undefined;
};

export const TranscriptEntryListItem = ({
  entry,
  isActive,
  currentTimeSeconds,
  calendarEventParticipant,
}: TranscriptEntryListItemProps) => {
  const speakerDisplayName =
    calendarEventParticipant?.displayName ?? entry.speakerName;

  return (
    <StyledEntry $isActive={isActive}>
      <StyledEntryHeader>
        <Chip
          clickable={false}
          isBold
          label={speakerDisplayName}
          variant={ChipVariant.Transparent}
          leftComponent={
            <Avatar
              avatarUrl={calendarEventParticipant?.avatarUrl}
              placeholder={speakerDisplayName}
              placeholderColorSeed={
                calendarEventParticipant?.placeholderColorSeed ??
                speakerDisplayName
              }
              size="md"
              type="rounded"
            />
          }
        />
        {!isUndefined(entry.startSeconds) && (
          <StyledTimestamp>
            {formatSecondsAsClockTimestamp(entry.startSeconds)}
          </StyledTimestamp>
        )}
      </StyledEntryHeader>
      <StyledEntryText>
        {entry.words.map((word, wordIndex) => (
          <StyledWord
            key={wordIndex}
            $isSpoken={isWordSpoken({ word, currentTimeSeconds })}
          >
            {wordIndex > 0 ? ' ' : ''}
            {word.text}
          </StyledWord>
        ))}
      </StyledEntryText>
    </StyledEntry>
  );
};

const isWordSpoken = ({
  word,
  currentTimeSeconds,
}: {
  word: TranscriptWord;
  currentTimeSeconds: number;
}): boolean =>
  !isUndefined(word.startSeconds) && currentTimeSeconds >= word.startSeconds;
