import { styled } from '@linaria/react';
import React from 'react';

import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { RecordChip } from '@/object-record/components/RecordChip';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { Avatar } from 'twenty-ui/data-display';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledAvatarContainer = styled.span`
  margin-right: ${odelzaThemeCssVariables.spacing[1]};
`;

const StyledSenderName = styled.span<{ variant?: 'default' | 'bold' }>`
  color: ${odelzaThemeCssVariables.font.color.primary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${({ variant }) =>
    variant === 'bold'
      ? odelzaThemeCssVariables.font.weight.medium
      : odelzaThemeCssVariables.font.weight.regular};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
`;

const StyledChip = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: 20px;
  padding: ${odelzaThemeCssVariables.spacing[1]};
  white-space: nowrap;
`;

type ParticipantChipVariant = 'default' | 'bold';

export const ParticipantChip = ({
  participant,
  variant = 'default',
  className,
}: {
  participant: any;
  variant?: ParticipantChipVariant;
  className?: string;
}) => {
  const { person, workspaceMember } = participant;

  const displayName = getDisplayNameFromParticipant({
    participant,
    shouldUseFullName: true,
  });

  const avatarUrl = person?.avatarUrl ?? workspaceMember?.avatarUrl ?? '';

  return (
    <StyledContainer className={className}>
      {person ? (
        <RecordChip
          objectNameSingular={CoreObjectNameSingular.Person}
          record={person}
          isBold={variant === 'bold'}
        />
      ) : (
        <StyledChip>
          <StyledAvatarContainer>
            <Avatar
              avatarUrl={getAbsoluteImageUrl(avatarUrl)}
              type="rounded"
              placeholder={displayName}
              size="sm"
            />
          </StyledAvatarContainer>
          <StyledSenderName variant={variant}>{displayName}</StyledSenderName>
        </StyledChip>
      )}
    </StyledContainer>
  );
};
