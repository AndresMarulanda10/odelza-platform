import { ToolRegistryService } from '../tool-registry.service';
import { ToolCategory } from 'twenty-shared/ai';

describe('conditional descriptor registry hydration', () => {
  it('retains updateMode through targeted lookup and relays typed errors through its closure', async () => {
    const name = 'conditional_update_one_widget';
    const descriptor = {
      name,
      category: ToolCategory.DATABASE_CRUD,
      label: 'Update widget',
      description: 'Conditional update',
      executionRef: {
        kind: 'database_crud',
        objectNameSingular: 'widget',
        operation: 'update_one',
        updateMode: 'conditional',
      },
    };
    const inputSchema = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        data: { type: 'object' },
        precondition: { type: 'object' },
      },
    };
    const generateDescriptors = jest.fn(async (_context, options) =>
      options.includeSchemas ? [{ ...descriptor, inputSchema }] : [descriptor],
    );
    const failure = {
      success: false,
      message: 'Conflict',
      error: 'Update precondition failed',
      errorCode: 'PRECONDITION_FAILED',
    };
    const dispatch = jest.fn().mockResolvedValue(failure);
    const registry = new ToolRegistryService(
      [
        {
          category: ToolCategory.DATABASE_CRUD,
          isAvailable: async () => true,
          generateDescriptors,
        },
      ] as never,
      { dispatch } as never,
      {} as never,
    );
    const tools = await registry.getToolsByName([name], {
      workspaceId: 'workspace',
      roleId: 'role',
    });
    const args = {
      id: 'id',
      data: { guard: 'next' },
      precondition: { guard: { eq: 'captured' } },
    };
    expect(await (tools[name].execute as any)(args)).toEqual(failure);
    expect(generateDescriptors.mock.calls[1][1]).toEqual({
      includeSchemas: true,
      toolNames: new Set([name]),
    });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ executionRef: descriptor.executionRef }),
      args,
      expect.objectContaining({ rolePermissionConfig: { unionOf: ['role'] } }),
    );
  });
});
