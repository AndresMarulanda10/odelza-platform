import {
  findToolPaginationSchema,
  generateFindToolInputSchema,
} from '../find-tool.zod-schema';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';

describe('MCP bounded find inputs', () => {
  it('preserves advertised 10 default and 100 maximum', () => {
    const schema = generateFindToolInputSchema({ fields: [] } as never);
    expect(schema.parse({ select: ['id'] })).toMatchObject({
      limit: 10,
      offset: 0,
    });
    expect(schema.safeParse({ select: ['id'], limit: 101 }).success).toBe(
      false,
    );
    expect(schema.parse({ select: ['id'], after: 'cursor' }).after).toBe(
      'cursor',
    );
  });
  it.each([
    { limit: '20' },
    { limit: 1.5 },
    { offset: -1 },
    { offset: Number.MAX_SAFE_INTEGER + 1 },
    { after: 'cursor', offset: 1 },
    { after: '' },
  ])('rejects invalid execution pagination %p', (input) => {
    expect(findToolPaginationSchema.safeParse(input).success).toBe(false);
  });
  it('validates and supplies defaults when dispatch bypasses the advertised schema', async () => {
    const find = { execute: jest.fn().mockResolvedValue({ success: true }) };
    const executor = Object.assign(
      Object.create(ToolExecutorService.prototype),
      { findRecordsService: find },
    ) as ToolExecutorService;
    const descriptor = {
      executionRef: {
        kind: 'database_crud',
        operation: 'find_many',
        objectNameSingular: 'item',
      },
    };
    const context = {
      authContext: { workspace: { id: 'workspace-a' } },
      rolePermissionConfig: { type: 'role' },
    };
    await executor.dispatch(
      descriptor as never,
      { select: ['id'], after: 'cursor' },
      context as never,
    );
    expect(find.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 10,
        offset: 0,
        after: 'cursor',
        filter: {},
        rolePermissionConfig: context.rolePermissionConfig,
      }),
    );
    find.execute.mockClear();
    const invalid = await executor.dispatch(
      descriptor as never,
      { limit: 101 },
      context as never,
    );
    expect(invalid.success).toBe(false);
    expect(find.execute).not.toHaveBeenCalled();
  });
});
