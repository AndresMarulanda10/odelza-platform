import { EventCardMessageBodyNotShared } from '@/activities/timeline-activities/rows/message/components/EventCardMessageBodyNotShared';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledEventCardMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledEmailContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[4]};
  justify-content: center;
  width: 100%;
`;

const StyledEmailTitle = styled.div`
  color: ${odelzaThemeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  margin-top: ${odelzaThemeCssVariables.spacing[2]};
`;

export const EventCardMessageForbidden = ({
  notSharedByFullName,
}: {
  notSharedByFullName: string;
}) => {
  return (
    <StyledEventCardMessageContainer>
      <StyledEmailContent>
        <StyledEmailTitle>
          <Trans>Subject not shared</Trans>
        </StyledEmailTitle>
        <EventCardMessageBodyNotShared
          notSharedByFullName={notSharedByFullName}
        />
      </StyledEmailContent>
    </StyledEventCardMessageContainer>
  );
};
