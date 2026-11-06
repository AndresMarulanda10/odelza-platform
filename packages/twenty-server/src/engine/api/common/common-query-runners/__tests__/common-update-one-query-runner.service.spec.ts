import { CommonUpdateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-one-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from '../errors/common-query-runner.exception';
import { commonQueryRunnerToGraphqlApiExceptionHandler } from '../utils/common-query-runner-to-graphql-api-exception-handler.util';
import { commonQueryRunnerToRestApiExceptionHandler } from '../utils/common-query-runner-to-rest-api-exception-handler.util';
import { FilterArgProcessorService } from 'src/engine/api/common/common-args-processors/filter-arg-processor/filter-arg-processor.service';
import { CommonUpdateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-many-query-runner.service';
import { type CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  type CommonExtendedInput,
  type UpdateOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';

describe('CommonUpdateOne conditional updates', () => {
  it('maps typed conflicts through both existing public exception adapters', () => {
    expect.assertions(2);
    const error = new CommonQueryRunnerException(
      'Update precondition failed',
      CommonQueryRunnerExceptionCode.PRECONDITION_FAILED,
      { userFriendlyMessage: { id: 'Update precondition failed' } },
    );
    try {
      commonQueryRunnerToGraphqlApiExceptionHandler(error);
    } catch (mapped) {
      expect(mapped).toMatchObject({
        extensions: { code: 'CONFLICT', subCode: 'PRECONDITION_FAILED' },
      });
    }
    try {
      commonQueryRunnerToRestApiExceptionHandler(error);
    } catch (mapped) {
      expect(mapped).toMatchObject({
        status: 409,
        response: { message: error.message, subCode: 'PRECONDITION_FAILED' },
      });
    }
  });
  const id = '06c544bb-0122-4672-8041-dbc59fa5d4f4';
  const precondition = { guard: { eq: 'captured-token' } };
  const context = {
    flatObjectMetadata: {
      id: 'widget',
      nameSingular: 'widget',
      fieldIds: ['guard', 'name'],
    },
    flatFieldMetadataMaps: {
      universalIdentifierById: { guard: 'guard', name: 'name' },
      byUniversalIdentifier: {
        guard: { id: 'guard', name: 'guard', type: 'TEXT' },
        name: { id: 'name', name: 'name', type: 'TEXT' },
      },
    },
    repository: {
      objectRecordsPermissions: {
        widget: { canReadObjectRecords: true, restrictedFields: {} },
      },
    },
    rolePermissionConfig: { intersectionOf: ['role'] },
  } as unknown as CommonExtendedQueryRunnerContext;
  const createRunner = (run: jest.Mock) => {
    const runner = new CommonUpdateOneQueryRunnerService({
      run,
    } as unknown as CommonUpdateManyQueryRunnerService);
    Object.assign(runner, {
      filterArgProcessor: new FilterArgProcessorService(),
    });
    return runner;
  };

  it('does not discard a supplied precondition when delegating the update', async () => {
    const run = jest.fn().mockResolvedValue([{ id }]);
    const runner = createRunner(run);
    const args = {
      id,
      data: { name: 'replacement' },
      precondition,
      selectedFieldsResult: {
        select: { id: true },
        relations: {},
        aggregate: {},
      },
    } as CommonExtendedInput<UpdateOneQueryArgs>;

    await runner.run(args, context);

    expect(run.mock.calls[0][0].filter).toEqual({
      and: [{ id: { eq: id } }, precondition],
    });
    expect(run.mock.calls[0][2]).toEqual({ conditionalUpdate: true });
  });

  it('does not enable conditional mode from a public flag without a precondition', async () => {
    const run = jest.fn().mockResolvedValue([{ id }]);
    await createRunner(run).run(
      {
        id,
        data: { name: 'legacy' },
        conditionalUpdate: true,
      } as unknown as CommonExtendedInput<UpdateOneQueryArgs>,
      context,
    );
    expect(run.mock.calls[0][0].filter).toEqual({ id: { eq: id } });
    expect(run.mock.calls[0][2]).toBeUndefined();
  });

  it('rejects unreadable guards before any mutation', async () => {
    const run = jest.fn();
    const restricted = {
      ...context,
      repository: {
        objectRecordsPermissions: {
          widget: {
            canReadObjectRecords: true,
            restrictedFields: { guard: { canRead: false } },
          },
        },
      },
    } as unknown as CommonExtendedQueryRunnerContext;
    await expect(
      createRunner(run).run(
        {
          id,
          data: { name: 'denied' },
          precondition,
          selectedFieldsResult: { select: {}, relations: {}, aggregate: {} },
        },
        restricted,
      ),
    ).rejects.toMatchObject({ code: 'INVALID_ARGS_FILTER' });
    expect(run).not.toHaveBeenCalled();
  });

  it('reports a uniform typed conflict when a conditional update returns no row', async () => {
    const runner = createRunner(jest.fn().mockResolvedValue([]));

    await expect(
      runner.run(
        {
          id,
          data: {},
          precondition,
          selectedFieldsResult: {
            select: { id: true },
            relations: {},
            aggregate: {},
          },
        },
        context,
      ),
    ).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
  });
});
