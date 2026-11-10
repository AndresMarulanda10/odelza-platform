import { styled } from '@linaria/react';

import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type EmailThreadMessageReceiversProps = {
  receivers: EmailThreadMessageParticipant[];
};

const StyledThreadMessageReceivers = styled.span`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  padding: ${odelzaThemeCssVariables.spacing[2]}
    ${odelzaThemeCssVariables.spacing[0]} ${odelzaThemeCssVariables.spacing[0]}
    ${odelzaThemeCssVariables.spacing[1]};
  width: 50%;
`;

export const EmailThreadMessageReceivers = ({
  receivers,
}: EmailThreadMessageReceiversProps) => {
  const displayedReceivers = receivers
    .map((receiver) => getDisplayNameFromParticipant({ participant: receiver }))
    .join(', ');

  const body = `to: ${displayedReceivers}`;

  return (
    <StyledThreadMessageReceivers>
      <OverflowingTextWithTooltip text={body} />
    </StyledThreadMessageReceivers>
  );
};
