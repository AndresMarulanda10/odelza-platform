import { workflowRunStateStepInfoSchema } from '../workflow-run-state-step-info-schema';
import { StepStatus } from '../../types/WorkflowRunStateStepInfos';

describe('conditional conflict workflow state', () => {
  it.each([StepStatus.FAILED, StepStatus.FAILED_SAFELY])(
    'retains typed conflict and history for %s',
    (status) => {
      const failure = {
        status,
        error: 'Update precondition failed',
        errorCode: 'PRECONDITION_FAILED',
      };
      expect(
        workflowRunStateStepInfoSchema.parse({
          ...failure,
          history: [failure],
        }),
      ).toEqual({ ...failure, history: [failure] });
    },
  );
});
