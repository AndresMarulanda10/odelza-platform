import { styled } from '@linaria/react';
import { Avatar } from 'twenty-ui/data-display';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledChip = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.transparent.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  display: inline-flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding: ${odelzaThemeCssVariables.spacing[1]}
    ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledPersonName = styled.span`
  color: ${odelzaThemeCssVariables.font.color.primary};
  max-width: min(40vw, 360px);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const WelcomePersonChip = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const firstName = currentWorkspaceMember?.name?.firstName ?? '';
  const lastName = currentWorkspaceMember?.name?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <StyledChip>
      <Avatar
        type="rounded"
        size="lg"
        placeholder={fullName}
        placeholderColorSeed={currentWorkspaceMember?.id}
        avatarUrl={getAbsoluteImageUrl(currentWorkspaceMember?.avatarUrl)}
      />
      <StyledPersonName>{fullName}</StyledPersonName>
    </StyledChip>
  );
};
