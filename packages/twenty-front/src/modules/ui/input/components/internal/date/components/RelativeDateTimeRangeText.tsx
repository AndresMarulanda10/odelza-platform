import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { IconArrowDown } from 'twenty-ui/icon';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  justify-content: center;
  min-height: 96px;
  padding: ${odelzaThemeCssVariables.spacing[4]}
    ${odelzaThemeCssVariables.spacing[2]};
  text-align: center;
`;

const StyledBound = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

type RelativeDateTimeRangeTextProps = {
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
};

export const RelativeDateTimeRangeText = ({
  start,
  end,
}: RelativeDateTimeRangeTextProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;

  const formatter = new Intl.DateTimeFormat(userLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: start.timeZoneId,
  });

  return (
    <StyledContainer>
      <StyledBound>
        {formatter.format(new Date(start.epochMilliseconds))}
      </StyledBound>
      <IconArrowDown
        size={14}
        color={odelzaThemeCssVariables.font.color.tertiary}
      />
      <StyledBound>
        {formatter.format(new Date(end.epochMilliseconds))}
      </StyledBound>
    </StyledContainer>
  );
};
