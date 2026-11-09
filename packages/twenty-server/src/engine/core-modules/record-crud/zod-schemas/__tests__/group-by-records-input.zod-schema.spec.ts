import { groupByRecordsToolArgumentsSchema } from '../group-by-records-input.zod-schema';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';

describe('direct group_by dispatch input', () => {
  it.each([
    { rolePermissionConfig: { shouldBypassPermissionChecks: true } },
    { authContext: { type: 'system' } },
    { limit: 101 },
    { groupBy: [] },
    { aggregateOperation: 'INVALID' },
  ])(
    'rejects raw arguments before invoking the grouping service %p',
    async (args) => {
      const groupByRecordsService = { execute: jest.fn() };
      const executor = Object.create(ToolExecutorService.prototype);
      Object.assign(executor, { groupByRecordsService });
      const result = await executor.dispatch(
        {
          executionRef: {
            kind: 'database_crud',
            operation: 'group_by',
            objectNameSingular: 'company',
          },
        },
        { groupBy: [{ status: true }], ...args },
        {
          authContext: { type: 'system' },
          rolePermissionConfig: { intersectionOf: ['trusted'] },
        },
      );
      expect(result.success).toBe(false);
      expect(groupByRecordsService.execute).not.toHaveBeenCalled();
    },
  );

  it('preserves advertised MCP limits and defaults', () => {
    expect(
      groupByRecordsToolArgumentsSchema.parse({ groupBy: [{ status: true }] }),
    ).toMatchObject({
      limit: 50,
      aggregateOperation: 'COUNT',
      orderBy: 'DESC',
    });
  });
});
