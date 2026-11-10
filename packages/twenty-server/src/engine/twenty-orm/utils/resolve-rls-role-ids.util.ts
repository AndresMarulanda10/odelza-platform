import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { resolveRoleIdFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-role-id-from-auth-context.util';

export const resolveRlsRoleIds = (
  args: Parameters<typeof resolveRoleIdFromAuthContext>[0] & {
    rolePermissionConfig?: RolePermissionConfig;
  },
): string[] => {
  const config = args.rolePermissionConfig;
  if (config !== undefined) {
    if (Object.keys(config).length !== 1) {
      throw new Error('Invalid trusted RLS role configuration');
    }
    if ('shouldBypassPermissionChecks' in config) {
      if (config.shouldBypassPermissionChecks !== true)
        throw new Error('Invalid trusted permission bypass');
      return [];
    }
    const roleIds =
      'intersectionOf' in config ? config.intersectionOf : config.unionOf;
    if (
      !Array.isArray(roleIds) ||
      roleIds.length === 0 ||
      roleIds.some(
        (roleId) => typeof roleId !== 'string' || roleId.length === 0,
      ) ||
      ('unionOf' in config && roleIds.length !== 1)
    ) {
      throw new Error('Invalid or unsupported trusted RLS role configuration');
    }
    return [...new Set(roleIds)];
  }
  const roleId = resolveRoleIdFromAuthContext(args);
  return roleId === undefined ? [] : [roleId];
};
