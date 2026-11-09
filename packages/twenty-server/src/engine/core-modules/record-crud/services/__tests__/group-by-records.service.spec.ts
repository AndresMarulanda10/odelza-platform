import { GroupByRecordsService } from 'src/engine/core-modules/record-crud/services/group-by-records.service';
import { FieldMetadataType } from 'twenty-shared/types';
import { Logger } from '@nestjs/common';

describe('GroupByRecordsService', () => {
  const fields = [
    { id: 'status', name: 'status', type: FieldMetadataType.TEXT },
    { id: 'amount', name: 'amount', type: FieldMetadataType.CURRENCY },
    {
      id: 'owner',
      name: 'owner',
      type: FieldMetadataType.RELATION,
      settings: { relationType: 'MANY_TO_ONE' },
    },
  ];
  const runner = { execute: jest.fn() };
  const builder = { build: jest.fn() };
  const processor = {
    getAvailableAggregations: jest.fn(() => ({})),
    resolveToolAggregateFieldKeyOrThrow: jest.fn(() => 'count'),
  };
  const service = new GroupByRecordsService(
    runner as never,
    builder as never,
    processor as never,
  );
  const params = {
    objectName: 'company',
    groupBy: [{ status: true }],
    authContext: { workspace: { id: 'workspace' } },
    rolePermissionConfig: { intersectionOf: ['role'] },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    builder.build.mockResolvedValue({
      queryRunnerContext: { trusted: true },
      flatObjectMetadata: {
        id: 'object',
        fieldIds: ['status', 'amount', 'owner'],
      },
      flatFieldMetadataMaps: {
        byUniversalIdentifier: Object.fromEntries(fields.map((f) => [f.id, f])),
        universalIdentifierById: Object.fromEntries(
          fields.map((f) => [f.id, f.id]),
        ),
      },
      objectsPermissions: { object: { restrictedFields: {} } },
    });
    runner.execute.mockResolvedValue({ results: [] });
  });
  afterAll(() => jest.restoreAllMocks());

  it.each([199, 200, 201])(
    'probes one extra group at the native runner boundary (%i)',
    async (count) => {
      runner.execute.mockResolvedValue({
        results: Array.from({ length: count }, (_, i) => ({
          groupByDimensionValues: [String(i)],
          count: '9007199254740993',
        })),
      });
      const output = await service.execute(params as never);
      expect(runner.execute.mock.calls[0][0].limit).toBe(201);
      expect(output.result).toMatchObject({
        groupCount: Math.min(count, 200),
        hasMore: count > 200,
        isComplete: count <= 200,
      });
      expect(output.result?.groups[0].value).toBe('9007199254740993');
      expect(output.result?.groups).toHaveLength(Math.min(count, 200));
    },
  );

  it('forwards trusted execution permissions, not filter properties', async () => {
    await service.execute(params as never);
    expect(builder.build).toHaveBeenCalledWith({
      objectName: 'company',
      authContext: params.authContext,
      rolePermissionConfig: params.rolePermissionConfig,
    });
  });

  it('accepts canonical relation foreign keys for both grouping and filtering', async () => {
    const output = await service.execute({
      ...params,
      groupBy: [{ ownerId: true }],
      filter: { ownerId: { in: ['11111111-1111-4111-8111-111111111111'] } },
    } as never);
    expect(output.success).toBe(true);
    expect(runner.execute).toHaveBeenCalledTimes(1);
    expect(runner.execute.mock.calls[0][0].filter).toEqual({
      ownerId: { in: ['11111111-1111-4111-8111-111111111111'] },
    });
  });

  it.each([
    { groupBy: [{ missing: true }] },
    { groupBy: [] },
    { groupBy: [{ status: false }] },
    { aggregateOperation: 'INVALID' },
    { limit: -1 },
    { limit: 1.5 },
    {
      filter: { rolePermissionConfig: { shouldBypassPermissionChecks: true } },
    },
    { filter: { missing: { eq: 'secret' } } },
    { filter: { and: [{ missing: { eq: 'secret' } }] } },
    { filter: { status: { invalidOperator: 'secret' } } },
    { aggregateOperation: 'SUM', aggregateFieldName: 'status' },
  ])('rejects invalid direct input %p before native query', async (input) => {
    expect(
      (await service.execute({ ...params, ...input } as never)).success,
    ).toBe(false);
    expect(runner.execute).not.toHaveBeenCalled();
  });

  it('rejects a restricted dimension even though it is not a selected output field', async () => {
    const context = await builder.build();
    context.objectsPermissions.object.restrictedFields.status = {
      canRead: false,
    };
    expect((await service.execute(params as never)).success).toBe(false);
    expect(runner.execute).not.toHaveBeenCalled();
  });
  it.each([
    {
      groupBy: [{ amount: { currencyCode: true } }],
      aggregateOperation: 'SUM',
      aggregateFieldName: 'amount.amountMicros',
    },
    { groupBy: [{ amount: { amountMicros: true } }] },
    {
      groupBy: [{ status: true }],
      filter: { and: [{ amount: { amountMicros: { gt: 0 } } }] },
    },
  ])(
    'rejects restricted composite aggregate, dimension, or filter %p',
    async (input) => {
      const context = await builder.build();
      context.objectsPermissions.object.restrictedFields.amount = {
        canRead: false,
      };
      expect(
        (await service.execute({ ...params, ...input } as never)).success,
      ).toBe(false);
      expect(runner.execute).not.toHaveBeenCalled();
    },
  );
  it('rejects restricted relation foreign-key dimensions', async () => {
    const context = await builder.build();
    context.objectsPermissions.object.restrictedFields.owner = {
      canRead: false,
    };
    expect(
      (
        await service.execute({
          ...params,
          groupBy: [{ ownerId: true }],
        } as never)
      ).success,
    ).toBe(false);
    expect(runner.execute).not.toHaveBeenCalled();
  });
  it('preserves currency amountMicros and an explicit currency dimension', async () => {
    processor.resolveToolAggregateFieldKeyOrThrow.mockReturnValueOnce(
      'sumAmountAmountMicros',
    );
    runner.execute.mockResolvedValue({
      results: [
        {
          groupByDimensionValues: ['USD'],
          sumAmountAmountMicros: '9007199254740993000000',
        },
      ],
    });
    const output = await service.execute({
      ...params,
      groupBy: [{ amount: { currencyCode: true } }],
      aggregateOperation: 'SUM',
      aggregateFieldName: 'amount.amountMicros',
    } as never);
    expect(output.result).toMatchObject({
      dimensionLabels: ['amount.currencyCode'],
      aggregation: 'SUM',
      groups: [{ dimensions: ['USD'], value: '9007199254740993000000' }],
    });
  });
});
