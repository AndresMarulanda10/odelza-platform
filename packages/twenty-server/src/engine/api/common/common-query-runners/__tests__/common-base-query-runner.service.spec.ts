import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';

jest.mock(
  'src/engine/twenty-orm/storage/orm-workspace-context.storage',
  () => ({
    getWorkspaceContext: jest.fn(),
  }),
);

describe('trusted query-runner permission configuration', () => {
  const getRepository = jest.fn(() => ({}));
  const prepare = async (config?: unknown) => {
    const runner = Object.create(CommonBaseQueryRunnerService.prototype);
    runner.globalWorkspaceOrmManager = {
      getGlobalWorkspaceDataSource: jest.fn(async () => ({ getRepository })),
    };
    return runner.prepareExtendedQueryRunnerContextWithGlobalDatasource({
      flatObjectMetadata: { nameSingular: 'company' },
      ...(config === undefined ? {} : { rolePermissionConfig: config }),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getWorkspaceContext as jest.Mock).mockReturnValue({
      authContext: { type: 'system', workspace: { id: 'workspace' } },
    });
  });

  it('uses the explicit internal workflow intersection at repository creation', async () => {
    const config = { intersectionOf: ['workflow-role', 'member-role'] };
    await prepare(config);
    expect(getRepository).toHaveBeenCalledWith('company', config);
  });

  it('preserves ambient system authentication when no override is provided', async () => {
    await prepare();
    expect(getRepository).toHaveBeenCalledWith('company', {
      shouldBypassPermissionChecks: true,
    });
  });
  it('preserves ambient user-role resolution when no override is provided', async () => {
    (getWorkspaceContext as jest.Mock).mockReturnValue({
      authContext: {
        type: 'user',
        userWorkspaceId: 'member',
        workspace: { id: 'workspace' },
      },
      userWorkspaceRoleMap: { member: 'ambient-role' },
      apiKeyRoleMap: {},
    });
    await prepare();
    expect(getRepository).toHaveBeenCalledWith('company', {
      intersectionOf: ['ambient-role'],
    });
  });

  it.each([
    null,
    {},
    { intersectionOf: [] },
    { unionOf: ['a', 'b'] },
    { shouldBypassPermissionChecks: false },
    { intersectionOf: ['role'], shouldBypassPermissionChecks: true },
  ])(
    'rejects malformed internal configuration %p before repository creation',
    async (config) => {
      await expect(prepare(config)).rejects.toThrow();
      expect(getRepository).not.toHaveBeenCalled();
    },
  );
});
