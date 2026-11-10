import { styled } from '@linaria/react';

import { EventRow } from '@/activities/timeline-activities/components/EventRow';
import { type EventGroup } from '@/activities/timeline-activities/utils/groupEventsByMonth';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type EventsGroupProps = {
  group: EventGroup;
  month: string;
  year?: number;
  mainObjectMetadataItem: EnrichedObjectMetadataItem | null;
};

const StyledActivityGroup = styled.div`
  display: flex;
  flex-flow: column;
  gap: ${odelzaThemeCssVariables.spacing[4]};
  margin-bottom: ${odelzaThemeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledActivityGroupContainer = styled.div`
  margin-bottom: ${odelzaThemeCssVariables.spacing[3]};
  margin-top: ${odelzaThemeCssVariables.spacing[3]};
  position: relative;
`;

const StyledActivityGroupBar = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 24px;
`;

const StyledMonthSeperator = styled.div`
  align-items: center;
  align-self: stretch;
  color: ${odelzaThemeCssVariables.font.color.light};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  gap: ${odelzaThemeCssVariables.spacing[4]};
`;
const StyledMonthSeperatorLine = styled.div`
  background: ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.pill};
  corner-shape: round;
  flex: 1 0 0;
  height: 1px;
`;

export const EventsGroup = ({
  group,
  month,
  year,
  mainObjectMetadataItem,
}: EventsGroupProps) => {
  return (
    <StyledActivityGroup>
      <StyledMonthSeperator>
        {month} {year}
        <StyledMonthSeperatorLine />
      </StyledMonthSeperator>
      <StyledActivityGroupContainer>
        <StyledActivityGroupBar />
        {group.items.map((event, index) => (
          <EventRow
            mainObjectMetadataItem={mainObjectMetadataItem}
            key={index}
            event={event}
            isLastEvent={index === group.items.length - 1}
          />
        ))}
      </StyledActivityGroupContainer>
    </StyledActivityGroup>
  );
};
