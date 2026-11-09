import { WorkflowSchemaWorkspaceService } from '../workflow-schema.workspace-service';
import {
  WorkflowActionType,
  type BaseOutputSchemaV2,
} from 'twenty-shared/workflow';
import { inferArrayItemSchema } from '../utils/infer-array-item-schema';

describe('group records output schema', () => {
  const service = new WorkflowSchemaWorkspaceService({} as never, {} as never);
  it('describes the actual unwrapped result and returned-group completeness', async () => {
    const schema = await service.computeStepOutputSchema({
      step: { type: WorkflowActionType.GROUP_BY_RECORDS } as never,
      workspaceId: 'workspace',
    });
    expect(schema).toMatchObject({
      groups: {
        isLeaf: true,
        type: 'array',
        value: [{ dimensions: [null], value: null }],
      },
      groupCount: { type: 'number' },
      hasMore: { type: 'boolean' },
      isComplete: { type: 'boolean' },
    });
    const groups = (schema as BaseOutputSchemaV2).groups;
    const item = inferArrayItemSchema({ schemaNode: groups });
    expect(item.isLeaf).toBe(false);
    if (item.isLeaf) throw new Error('Expected group item schema');
    expect(
      inferArrayItemSchema({ schemaNode: item.value.dimensions }),
    ).toMatchObject({ type: 'unknown' });
    expect(item.value.value).toMatchObject({ type: 'unknown' });
    expect(schema).not.toHaveProperty('result');
    expect(schema).not.toHaveProperty('totalCount');
  });
  it('exposes dimension and aggregate variables inside an iterator over groups', async () => {
    const common = {
      getWorkflowVersionOrFail: jest.fn(async () => ({
        steps: [{ id: 'group', type: WorkflowActionType.GROUP_BY_RECORDS }],
      })),
    };
    const schemaService = new WorkflowSchemaWorkspaceService(
      common as never,
      {} as never,
    );
    const schema = await schemaService.computeStepOutputSchema({
      step: {
        type: WorkflowActionType.ITERATOR,
        settings: { input: { items: '{{group.groups}}' } },
      } as never,
      workspaceId: 'workspace',
      workflowVersionId: 'version',
    });
    expect(schema).toMatchObject({
      currentItem: {
        isLeaf: false,
        type: 'object',
        value: {
          dimensions: { isLeaf: true, type: 'array' },
          value: { isLeaf: true, type: 'unknown' },
        },
      },
    });
  });
});
