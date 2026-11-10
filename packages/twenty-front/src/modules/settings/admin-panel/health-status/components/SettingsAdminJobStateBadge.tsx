import { styled } from '@linaria/react';
import { Tag, type TagColor } from 'twenty-ui/data-display';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { JobState } from '~/generated-admin/graphql';

type SettingsAdminJobStateBadgeProps = {
  state: JobState;
  attemptsMade?: number;
};

const JOB_STATE_COLORS: Record<JobState, TagColor> = {
  [JobState.COMPLETED]: 'green',
  [JobState.FAILED]: 'red',
  [JobState.ACTIVE]: 'blue',
  [JobState.WAITING]: 'gray',
  [JobState.DELAYED]: 'orange',
  [JobState.PRIORITIZED]: 'blue',
  [JobState.WAITING_CHILDREN]: 'gray',
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledAttemptBadge = styled.span`
  background-color: ${odelzaThemeCssVariables.background.danger};
  border: 1px solid ${odelzaThemeCssVariables.border.color.danger};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  color: ${odelzaThemeCssVariables.font.color.danger};
  font-size: ${odelzaThemeCssVariables.font.size.xs};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  padding: ${odelzaThemeCssVariables.spacing['0.5']}
    ${odelzaThemeCssVariables.spacing[1]};
  white-space: nowrap;
`;

export const SettingsAdminJobStateBadge = ({
  state,
  attemptsMade = 1,
}: SettingsAdminJobStateBadgeProps) => {
  const color = JOB_STATE_COLORS[state] || 'gray';
  const showAttempts = attemptsMade > 1;

  return (
    <StyledContainer>
      <Tag color={color} text={state} />
      {showAttempts && (
        <StyledAttemptBadge>{attemptsMade} attempts</StyledAttemptBadge>
      )}
    </StyledContainer>
  );
};
