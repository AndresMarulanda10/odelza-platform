import {
  workflowFindRecordsActionSchema,
  workflowIteratorActionSchema,
  workflowCodeActionSchema,
} from 'twenty-shared/workflow';
import { FindRecordsWorkflowAction } from '../find-records.workflow-action';
import { IteratorWorkflowAction } from '../../iterator/iterator.workflow-action';
import { CodeWorkflowAction } from '../../code/code.workflow-action';

describe('workflow bounded page authoring and execution', () => {
  const settings = {
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  };
  const step = (input: Record<string, unknown>) => ({
    id: 'find',
    name: 'Read page',
    type: 'FIND_RECORDS',
    valid: true,
    nextStepIds: ['process'],
    settings: { ...settings, input: { objectName: 'item', ...input } },
  });
  const pageInfo = {
    hasNextPage: true,
    hasPreviousPage: false,
    startCursor: 'start',
    endCursor: 'end',
  };
  const find = {
    execute: jest.fn().mockResolvedValue({
      success: true,
      result: { records: [{ id: 'one' }], count: 401, pageInfo },
    }),
  };
  const authContext = { workspace: { id: 'workspace-a' } };
  const action = new FindRecordsWorkflowAction(
    find as never,
    {
      getExecutionContext: async () => ({
        authContext,
        rolePermissionConfig: { type: 'role' },
      }),
    } as never,
    {
      getObjectMetadataInfo: async () => ({
        flatFieldMetadataMaps: { byUniversalIdentifier: {} },
      }),
    } as never,
  );
  const input = (paging: Record<string, unknown>, context = {}) => ({
    currentStepId: 'find',
    steps: [step(paging)],
    context,
    runInfo: { workspaceId: 'workspace-a', workflowRunId: 'run' },
  });

  it('preserves legacy outputs and exposes pageInfo', async () => {
    expect(await action.execute(input({}) as never)).toEqual({
      result: {
        first: { id: 'one' },
        all: [{ id: 'one' }],
        totalCount: 401,
        pageInfo,
      },
    });
    expect(find.execute).toHaveBeenLastCalledWith(
      expect.objectContaining({
        limit: undefined,
        offset: 0,
        authContext,
        rolePermissionConfig: { type: 'role' },
      }),
    );
  });
  it.each([
    'text',
    ' 200 ',
    '{{loop.currentItem}} trailing',
    '{{a}}{{b}}',
    -1,
    1.5,
  ])('rejects invalid authored offset %p', async (offset) => {
    await expect(action.execute(input({ offset }) as never)).rejects.toThrow();
  });
  it.each([undefined, null, [], 'garbage', '200,400'])(
    'rejects unresolved or invalid binding %p',
    async (value) => {
      await expect(
        action.execute(
          input(
            { offset: '{{loop.currentItem}}' },
            { loop: { currentItem: value } },
          ) as never,
        ),
      ).rejects.toThrow();
    },
  );
  it('resolves cursor bindings and strict numeric string limits', async () => {
    await action.execute(
      input(
        {
          after: '{{previous.pageInfo.endCursor}}',
          limit: '{{options.pageSize}}',
        },
        { previous: { pageInfo }, options: { pageSize: '200' } },
      ) as never,
    );
    expect(find.execute).toHaveBeenLastCalledWith(
      expect.objectContaining({ after: 'end', limit: 200, offset: 0 }),
    );
  });

  it('authors Code → Iterator offsets → Find Records → per-page Code processing', async () => {
    const ids = {
      code: '11111111-1111-4111-8111-111111111111',
      loop: '22222222-2222-4222-8222-222222222222',
      find: '33333333-3333-4333-8333-333333333333',
      process: '44444444-4444-4444-8444-444444444444',
    };
    const code = workflowCodeActionSchema.parse({
      id: ids.code,
      name: 'Plan offsets',
      type: 'CODE',
      valid: true,
      nextStepIds: [ids.loop],
      settings: {
        ...settings,
        input: { logicFunctionId: 'plan-offsets', logicFunctionInput: {} },
      },
    });
    const iterator = workflowIteratorActionSchema.parse({
      id: ids.loop,
      name: 'Each page',
      type: 'ITERATOR',
      valid: true,
      nextStepIds: [],
      settings: {
        ...settings,
        input: {
          items: `{{${ids.code}.offsets}}`,
          initialLoopStepIds: [ids.find],
        },
      },
    });
    const findStep = workflowFindRecordsActionSchema.parse({
      ...step({ limit: 200, offset: `{{${ids.loop}.currentItem}}` }),
      id: ids.find,
      nextStepIds: [ids.process],
    });
    const process = workflowCodeActionSchema.parse({
      id: ids.process,
      name: 'Process bounded page',
      type: 'CODE',
      valid: true,
      nextStepIds: [ids.loop],
      settings: {
        ...settings,
        input: {
          logicFunctionId: 'process-page',
          logicFunctionInput: { records: `{{${ids.find}.all}}` },
        },
      },
    });
    const steps = [code, iterator, findStep, process];
    const state: { stepInfos: Record<string, any> } = { stepInfos: {} };
    const iteratorAction = new IteratorWorkflowAction({
      getWorkflowRunOrFail: async () => ({ state }),
      updateWorkflowRunStepInfos: async () => {},
    } as never);
    const executor = {
      execute: jest.fn(async ({ logicFunctionId, payload }) => ({
        data:
          logicFunctionId === 'plan-offsets'
            ? { offsets: [0, 200, 400] }
            : { processed: payload.records.length },
      })),
    };
    const codeAction = new CodeWorkflowAction(
      executor as never,
      { setStepLog: async () => {} } as never,
    );
    const context: Record<string, unknown> = {};
    const common = {
      steps,
      context,
      runInfo: { workspaceId: 'workspace-a', workflowRunId: 'run' },
    };
    context[ids.code] = (
      await codeAction.execute({ ...common, currentStepId: ids.code } as never)
    ).result;
    find.execute.mockClear();
    for (const offset of [0, 200, 400]) {
      const iteration = await iteratorAction.execute({
        ...common,
        currentStepId: ids.loop,
      } as never);
      context[ids.loop] = iteration.result;
      state.stepInfos[ids.loop] = { result: iteration.result };
      expect(iteration.result).toMatchObject({
        currentItem: offset,
        hasProcessedAllItems: false,
      });
      context[ids.find] = (
        await action.execute({ ...common, currentStepId: ids.find } as never)
      ).result;
      expect(find.execute).toHaveBeenLastCalledWith(
        expect.objectContaining({ offset, limit: 200 }),
      );
      expect(
        (
          await codeAction.execute({
            ...common,
            currentStepId: ids.process,
          } as never)
        ).result,
      ).toEqual({ processed: 1 });
    }
    expect(
      (
        await iteratorAction.execute({
          ...common,
          currentStepId: ids.loop,
        } as never)
      ).result,
    ).toMatchObject({ hasProcessedAllItems: true });
    expect(find.execute).toHaveBeenCalledTimes(3);
  });
});
