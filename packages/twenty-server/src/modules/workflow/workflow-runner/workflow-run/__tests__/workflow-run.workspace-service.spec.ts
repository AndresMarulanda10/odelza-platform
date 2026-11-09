import { WorkflowRunWorkspaceService } from '../workflow-run.workspace-service';
import { StepStatus } from 'twenty-shared/workflow';

describe('workflow step error-code persistence', () => {
  const failure = {
    status: StepStatus.FAILED,
    error: 'Update precondition failed',
    errorCode: 'PRECONDITION_FAILED',
  };
  const makeService = () => {
    const run = {
      id: 'run',
      state: { stepInfos: { step: { ...failure, history: [failure] } } },
    };
    const update = jest.fn().mockImplementation(async (_id, partial) => {
      Object.assign(run, partial);
    });
    const repository = {
      findOne: jest.fn(async () => run),
      findOneBy: jest.fn(async () => run),
      update,
    };
    const service = new WorkflowRunWorkspaceService(
      {
        executeInWorkspaceContext: (callback: () => unknown) => callback(),
        getRepository: async () => repository,
      } as never,
      {} as never,
      {} as never,
      {} as never,
    );
    Object.assign(service, {
      cacheLockService: { withLock: (callback: () => unknown) => callback() },
    });
    return { service, run, update };
  };
  it.each([StepStatus.FAILED, StepStatus.FAILED_SAFELY])(
    'persists the code through the actual updateStepInfo/updateWorkflowRun path for %s',
    async (status) => {
      const { service, update, run } = makeService();
      delete (run.state.stepInfos.step as { errorCode?: string }).errorCode;
      await service.updateWorkflowRunStepInfo({
        stepId: 'step',
        workflowRunId: 'run',
        workspaceId: 'workspace',
        stepInfo: { ...failure, status },
      });
      expect(update.mock.calls[0][1].state.stepInfos.step).toMatchObject({
        errorCode: 'PRECONDITION_FAILED',
        status,
      });
    },
  );
  it.each([StepStatus.NOT_STARTED, StepStatus.RUNNING, StepStatus.SUCCESS])(
    'clears stale current code for %s but retains historical codes',
    async (status) => {
      const { service, run } = makeService();
      await service.updateWorkflowRunStepInfo({
        stepId: 'step',
        workflowRunId: 'run',
        workspaceId: 'workspace',
        stepInfo: { status },
      });
      expect(run.state.stepInfos.step.errorCode).toBeUndefined();
      expect(run.state.stepInfos.step.history[0].errorCode).toBe(
        'PRECONDITION_FAILED',
      );
    },
  );
  it('clears stale codes through the batch update path used by resets', async () => {
    const { service, run } = makeService();
    await service.updateWorkflowRunStepInfos({
      workflowRunId: 'run',
      workspaceId: 'workspace',
      stepInfos: { step: { status: StepStatus.NOT_STARTED } },
    });
    expect(run.state.stepInfos.step.errorCode).toBeUndefined();
    expect(run.state.stepInfos.step.history[0]).toEqual(failure);
  });
  it('keeps old code-free states compatible', async () => {
    const { service, run } = makeService();
    delete (run.state.stepInfos.step as { errorCode?: string }).errorCode;
    await service.updateWorkflowRunStepInfo({
      workflowRunId: 'run',
      workspaceId: 'workspace',
      stepId: 'step',
      stepInfo: { status: StepStatus.FAILED, error: 'Legacy error' },
    });
    expect(JSON.parse(JSON.stringify(run.state.stepInfos.step))).toMatchObject({
      status: StepStatus.FAILED,
      error: 'Legacy error',
    });
    expect(
      JSON.parse(JSON.stringify(run.state.stepInfos.step)),
    ).not.toHaveProperty('errorCode');
  });
});
