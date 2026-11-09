import { CommonApiContextBuilderService } from '../common-api-context-builder.service';

describe('grouping trusted context construction', () => {
  const object = {
    id: 'object',
    nameSingular: 'company',
    namePlural: 'companies',
    fieldIds: [],
  };
  const metadata = {
    getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(async () => ({
      flatObjectMetadataMaps: {
        universalIdentifierById: { object: 'object' },
        byUniversalIdentifier: { object },
      },
      flatFieldMetadataMaps: {
        universalIdentifierById: {},
        byUniversalIdentifier: {},
      },
      flatIndexMaps: {},
    })),
  };
  const cache = {
    getOrRecompute: jest.fn(async () => ({
      rolesPermissions: {
        workflow: {
          object: { canReadObjectRecords: true, restrictedFields: {} },
        },
        member: {
          object: {
            canReadObjectRecords: true,
            restrictedFields: { secret: { canRead: false } },
          },
        },
      },
    })),
  };
  const userRole = { getRoleIdForUserWorkspace: jest.fn(async () => 'member') };
  const builder = new CommonApiContextBuilderService(
    metadata as never,
    cache as never,
    userRole as never,
    {} as never,
  );
  const authContext = {
    type: 'user',
    workspace: { id: 'workspace' },
    userWorkspaceId: 'member',
  };
  beforeEach(() => jest.clearAllMocks());

  it('uses the same explicit intersection for readable metadata and native runner context', async () => {
    const config = { intersectionOf: ['workflow', 'member'] };
    const context = await builder.build({
      authContext: authContext as never,
      objectName: 'company',
      rolePermissionConfig: config,
    });
    expect(context.queryRunnerContext.rolePermissionConfig).toEqual(config);
    expect(
      context.objectsPermissions.object.restrictedFields.secret.canRead,
    ).toBe(false);
    expect(userRole.getRoleIdForUserWorkspace).not.toHaveBeenCalled();
    expect(cache.getOrRecompute).toHaveBeenCalledWith('workspace', [
      'rolesPermissions',
    ]);
  });
  it('preserves caller-role metadata resolution when no configuration was supplied', async () => {
    const context = await builder.build({
      authContext: authContext as never,
      objectName: 'company',
    });
    expect(context.queryRunnerContext).not.toHaveProperty(
      'rolePermissionConfig',
    );
    expect(userRole.getRoleIdForUserWorkspace).toHaveBeenCalled();
  });
  it('fails closed for unknown roles', async () => {
    await expect(
      builder.build({
        authContext: authContext as never,
        objectName: 'company',
        rolePermissionConfig: { intersectionOf: ['unknown'] },
      }),
    ).rejects.toThrow();
  });
});
