import { ToolExecutorService } from '../tool-executor.service';
import { type ToolIndexEntry } from '../../types/tool-index-entry.type';
import { type ToolProviderContext } from '../../interfaces/tool-provider-context.type';

describe('trusted conditional tool dispatch', () => {
  const id = '06c544bb-0122-4672-8041-dbc59fa5d4f4';
  const context = {
    authContext: { workspace: { id: 'workspace' } },
    rolePermissionConfig: { intersectionOf: ['trusted-role'] },
  } as ToolProviderContext;
  const descriptor = (conditional: boolean) =>
    ({
      name: conditional ? 'conditional_update_one_widget' : 'update_one_widget',
      executionRef: {
        kind: 'database_crud',
        objectNameSingular: 'widget',
        operation: 'update_one',
        ...(conditional ? { updateMode: 'conditional' } : {}),
      },
    }) as ToolIndexEntry;
  const execute = jest.fn();
  const service = Object.create(
    ToolExecutorService.prototype,
  ) as ToolExecutorService;
  Object.assign(service, { updateRecordService: { execute } });
  beforeEach(() =>
    execute
      .mockReset()
      .mockResolvedValue({ success: true, message: 'updated' }),
  );
  it('unwraps only the trusted conditional descriptor and retains its error code', async () => {
    const failure = {
      success: false,
      message: 'conflict',
      error: 'Update precondition failed',
      errorCode: 'PRECONDITION_FAILED',
    };
    execute.mockResolvedValue(failure);
    const args = {
      id,
      data: { guard: 'next' },
      precondition: { guard: { eq: 'captured' } },
    };
    expect(await service.dispatch(descriptor(true), args, context)).toEqual(
      failure,
    );
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        objectRecord: args.data,
        precondition: args.precondition,
        rolePermissionConfig: context.rolePermissionConfig,
      }),
    );
  });
  it.each([
    { id, data: { name: 'x' } },
    { id, data: {}, precondition: {} },
    {
      id,
      data: { name: 'x' },
      precondition: { guard: { eq: 'old' } },
      shouldBypassPermissionChecks: true,
    },
    {
      id,
      data: { name: 'x' },
      precondition: { guard: { eq: 'old' } },
      updateMode: 'conditional',
    },
    {
      id,
      data: { name: 'x' },
      precondition: { guard: { eq: 'old' } },
      authContext: {},
    },
    {
      id,
      data: { name: 'x' },
      precondition: { guard: { eq: 'old' } },
      rolePermissionConfig: { shouldBypassPermissionChecks: true },
    },
  ])(
    'rejects missing conditions and external flag injection: %p',
    async (args) => {
      expect(
        await service.dispatch(descriptor(true), args, context),
      ).toMatchObject({ success: false });
      expect(execute).not.toHaveBeenCalled();
    },
  );
  it('keeps legacy custom data/precondition fields flat and ignores public mode selection', async () => {
    const fields = {
      data: 'custom-data',
      precondition: 'custom-condition',
      updateMode: 'conditional',
    };
    await service.dispatch(descriptor(false), { id, ...fields }, context);
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        objectRecord: fields,
        rolePermissionConfig: context.rolePermissionConfig,
      }),
    );
    expect(execute.mock.calls[0][0].precondition).toBeUndefined();
  });

  it('retains paging, grouping and conditional writes in the same trusted dispatcher', async () => {
    const page = {
      success: true,
      records: [{ id }],
      count: 401,
      pageInfo: { hasNextPage: true, endCursor: 'next-page' },
    };
    const grouped = {
      success: true,
      groups: [{ dimensions: ['active'], value: 401 }],
      groupCount: 1,
      hasMore: false,
      isComplete: true,
    };
    const find = jest.fn().mockResolvedValue(page);
    const group = jest.fn().mockResolvedValue(grouped);
    Object.assign(service, {
      findRecordsService: { execute: find },
      groupByRecordsService: { execute: group },
    });
    const readDescriptor = (operation: 'find_many' | 'group_by') =>
      ({
        name: `${operation}_widgets`,
        executionRef: {
          kind: 'database_crud',
          objectNameSingular: 'widget',
          operation,
        },
      }) as ToolIndexEntry;
    const filter = { status: { eq: 'active' } };

    expect(
      await service.dispatch(
        readDescriptor('find_many'),
        { ...filter, limit: 100, after: 'previous-page' },
        context,
      ),
    ).toEqual(page);
    expect(
      await service.dispatch(
        readDescriptor('group_by'),
        { ...filter, groupBy: [{ status: true }], aggregateOperation: 'COUNT' },
        context,
      ),
    ).toEqual(grouped);
    const precondition = { guard: { eq: 'captured' } };
    await service.dispatch(
      descriptor(true),
      { id, data: { guard: 'next' }, precondition },
      context,
    );
    await service.dispatch(descriptor(false), { id, guard: 'legacy' }, context);

    const trustedContext = {
      authContext: context.authContext,
      rolePermissionConfig: context.rolePermissionConfig,
    };
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        ...trustedContext,
        filter,
        limit: 100,
        after: 'previous-page',
      }),
    );
    expect(group).toHaveBeenCalledWith(
      expect.objectContaining({ ...trustedContext, filter }),
    );
    expect(execute).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ ...trustedContext, precondition }),
    );
    expect(execute).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        ...trustedContext,
        objectRecord: { guard: 'legacy' },
      }),
    );
    expect(execute.mock.calls[1][0].precondition).toBeUndefined();
  });
});
