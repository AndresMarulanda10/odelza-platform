import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

type PermissionIconProps = {
  permission: SettingsRoleObjectPermissionKey;
  state: 'granted' | 'revoked';
};

const StyledIconWrapper = styled.div<{ isRevoked?: boolean }>`
  align-items: center;
  background: ${({ isRevoked }) =>
    isRevoked
      ? odelzaThemeCssVariables.color.orange3
      : odelzaThemeCssVariables.color.primary3};
  border: 1px solid
    ${({ isRevoked }) =>
      isRevoked
        ? odelzaThemeCssVariables.color.orange7
        : odelzaThemeCssVariables.color.primary7};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  display: flex;
  height: ${odelzaThemeCssVariables.spacing[4]};
  justify-content: center;
  width: ${odelzaThemeCssVariables.spacing[4]};
`;

const StyledIcon = styled.div<{ isRevoked?: boolean }>`
  align-items: center;
  color: ${({ isRevoked }) =>
    isRevoked
      ? odelzaThemeCssVariables.color.orange
      : odelzaThemeCssVariables.color.primary};
  display: flex;
  justify-content: center;
`;

export const PermissionIcon = ({ permission, state }: PermissionIconProps) => {
  const { Icon, IconForbidden } =
    SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[permission];

  const { theme } = useContext(ThemeContext);
  const isRevoked = state === 'revoked';

  return (
    <StyledIconWrapper isRevoked={isRevoked}>
      <StyledIcon isRevoked={isRevoked}>
        {isRevoked && <IconForbidden size={theme.icon.size.sm} />}
        {!isRevoked && <Icon size={theme.icon.size.sm} />}
      </StyledIcon>
    </StyledIconWrapper>
  );
};
