import { resolveRlsRoleIds } from 'src/engine/twenty-orm/utils/resolve-rls-role-ids.util';

describe('resolveRlsRoleIds', () => {
  const context = {
    authContext: { type: 'apiKey', apiKey: { id: 'key' } },
    userWorkspaceRoleMap: {},
    apiKeyRoleMap: { key: 'broad' },
  } as unknown as Parameters<typeof resolveRlsRoleIds>[0];

  it('retains auth-derived behavior without an explicit configuration', () => {
    expect(resolveRlsRoleIds(context)).toEqual(['broad']);
  });

  it('uses every explicit intersection role instead of the actor role', () => {
    expect(
      resolveRlsRoleIds({
        ...context,
        rolePermissionConfig: { intersectionOf: ['agent', 'limited'] },
      }),
    ).toEqual(['agent', 'limited']);
  });

  it.each([{ unionOf: ['agent', 'broad'] }, { intersectionOf: [] }])(
    'fails closed for unsupported or empty explicit configurations',
    (rolePermissionConfig) => {
      expect(() =>
        resolveRlsRoleIds({ ...context, rolePermissionConfig }),
      ).toThrow();
    },
  );
});
