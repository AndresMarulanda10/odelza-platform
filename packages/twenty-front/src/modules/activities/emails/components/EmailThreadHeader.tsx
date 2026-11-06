import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

type EmailThreadHeaderProps = {
  subject: string;
  lastMessageSentAt: string;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  background: ${odelzaThemeCssVariables.background.secondary};
  border-bottom: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[6]};
  padding: ${odelzaThemeCssVariables.spacing[6]};
`;

const StyledHead = styled.div`
  width: 100%;
`;

const StyledHeading = styled.h2`
  color: ${odelzaThemeCssVariables.font.color.primary};
  margin: 0;
  margin-bottom: ${odelzaThemeCssVariables.spacing[3]};
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledContent = styled.span`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  width: 100%;
`;

export const EmailThreadHeader = ({
  subject,
  lastMessageSentAt,
}: EmailThreadHeaderProps) => {
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const lastMessageSentAtFormatted = beautifyPastDateRelativeToNow(
    lastMessageSentAt,
    localeCatalog,
  );

  return (
    <StyledContainer>
      <StyledHead>
        <StyledHeading>{subject}</StyledHeading>
        {lastMessageSentAt && (
          <StyledContent>
            {t`Last message ${lastMessageSentAtFormatted}`}
          </StyledContent>
        )}
      </StyledHead>
    </StyledContainer>
  );
};
