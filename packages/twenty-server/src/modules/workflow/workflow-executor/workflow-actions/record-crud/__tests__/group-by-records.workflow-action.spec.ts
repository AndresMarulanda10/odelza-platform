import { GroupByRecordsWorkflowAction } from '../group-by-records.workflow-action';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { WorkflowActionType } from 'twenty-shared/workflow';

describe('native GroupByRecordsWorkflowAction', () => {
  const service = { execute: jest.fn() };
  const execution = { getExecutionContext: jest.fn() };
  const metadata = { getObjectMetadataInfo: jest.fn() };
  const action = new GroupByRecordsWorkflowAction(
    service as never,
    execution as never,
    metadata as never,
  );
  const step = {
    id: 'group',
    type: WorkflowActionType.GROUP_BY_RECORDS,
    settings: {
      input: {
        objectName: 'company',
        groupBy: [{ status: true }],
        limit: '{{previous.limit}}',
      },
    },
  };
  const request = {
    currentStepId: 'group',
    steps: [step],
    context: { previous: { limit: 10 } },
    runInfo: { workspaceId: 'workspace' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    execution.getExecutionContext.mockResolvedValue({
      authContext: { workspace: { id: 'workspace' } },
      rolePermissionConfig: { intersectionOf: ['workflow', 'member'] },
    });
    metadata.getObjectMetadataInfo.mockResolvedValue({
      flatFieldMetadataMaps: { byUniversalIdentifier: {} },
    });
    service.execute.mockResolvedValue({
      success: true,
      result: { groups: [], groupCount: 0, hasMore: false, isComplete: true },
    });
  });
  it('dispatches the public enum to the native action', () => {
    const factory = Object.create(WorkflowActionFactory.prototype);
    Object.assign(factory, { groupByRecordsWorkflowAction: action });
    expect(factory.get(WorkflowActionType.GROUP_BY_RECORDS)).toBe(action);
  });
  it('unwraps the legacy grouping payload and forwards trusted role/workspace context', async () => {
    expect(await action.execute(request as never)).toEqual({
      result: { groups: [], groupCount: 0, hasMore: false, isComplete: true },
    });
    expect(service.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        objectName: 'company',
        groupBy: [{ status: true }],
        limit: 10,
        authContext: { workspace: { id: 'workspace' } },
        rolePermissionConfig: { intersectionOf: ['workflow', 'member'] },
      }),
    );
  });
  it('does not query when a runtime variable has the wrong type', async () => {
    await expect(
      action.execute({
        ...request,
        context: { previous: { limit: '10' } },
      } as never),
    ).rejects.toThrow();
    expect(service.execute).not.toHaveBeenCalled();
  });
  it('returns native query failures without a successful result', async () => {
    service.execute.mockResolvedValue({
      success: false,
      error: 'Permission denied',
    });
    expect(await action.execute(request as never)).toEqual({
      error: 'Permission denied',
    });
  });
  it('rejects an unknown authored filter field instead of silently dropping its predicate', async () => {
    const filteredStep = {
      ...step,
      settings: {
        input: {
          ...step.settings.input,
          filter: {
            recordFilters: [
              {
                id: 'filter',
                fieldMetadataId: 'missing',
                type: 'TEXT',
                operand: 'IS',
                value: 'secret',
              },
            ],
          },
        },
      },
    };
    await expect(
      action.execute({ ...request, steps: [filteredStep] } as never),
    ).rejects.toThrow('Unknown or invalid group-by filter field');
    expect(service.execute).not.toHaveBeenCalled();
  });
});
