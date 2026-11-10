import { IteratorWorkflowAction } from '../iterator.workflow-action';
import { StepStatus } from 'twenty-shared/workflow';

describe('iterator conflict-code history and reset', () => {
  const failure = {
    status: StepStatus.FAILED_SAFELY,
    error: 'Update precondition failed',
    errorCode: 'PRECONDITION_FAILED',
  };
  const service = Object.create(
    IteratorWorkflowAction.prototype,
  ) as IteratorWorkflowAction;
  it('preserves a substep code in history while clearing the next iteration', async () => {
    const result = await (service as any).buildSubStepInfosReset({
      iteratorStepId: 'iterator',
      initialLoopStepIds: ['child'],
      stepInfos: { child: failure },
      steps: [{ id: 'child', nextStepIds: [] }],
    });
    expect(result.child.errorCode).toBeUndefined();
    expect(result.child.history[0]).toMatchObject(failure);
  });
  it('preserves an iterator code in history while clearing its current attempt', async () => {
    const result = await (service as any).buildIteratorStepInfoReset({
      iteratorStepId: 'iterator',
      iteratorStepInfo: failure,
    });
    expect(result.iterator.errorCode).toBeUndefined();
    expect(result.iterator.history[0]).toMatchObject(failure);
  });
  it('preserves legacy code-free iterator history', async () => {
    const legacy = { status: StepStatus.SUCCESS, result: { value: 1 } };
    const result = await (service as any).buildIteratorStepInfoReset({
      iteratorStepId: 'iterator',
      iteratorStepInfo: legacy,
    });
    expect(JSON.parse(JSON.stringify(result.iterator.history[0]))).toEqual(
      legacy,
    );
  });
});
