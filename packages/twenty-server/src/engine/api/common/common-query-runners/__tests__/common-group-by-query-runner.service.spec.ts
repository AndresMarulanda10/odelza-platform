import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';
import { formatResultWithGroupByDimensionValues } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/format-result-with-group-by-dimension-values.util';
import { type GroupByRecordsResult } from 'src/engine/core-modules/record-crud/types/group-by-records-result.type';

// The real native runner and aggregate-expression helper execute here. Only
// SQL transport is simulated; these tests do not prove PostgreSQL/RLS behavior.
describe('native group aggregation transport', () => {
  it('preserves numeric, boolean and null dimensions and scalar aggregate representations', async () => {
    const formatted = await formatResultWithGroupByDimensionValues({
      groupsResult: [
        { first: 42, second: true, aggregate: 7 },
        { first: null, second: false, aggregate: '9007199254740993' },
        { first: 0, second: null, aggregate: null },
      ],
      groupByDefinitions: [
        { alias: 'first', expression: 'first', columnNameWithQuotes: 'first' },
        {
          alias: 'second',
          expression: 'second',
          columnNameWithQuotes: 'second',
        },
      ],
      aggregateFieldNames: ['aggregate'],
    });
    const expected: GroupByRecordsResult['groups'] = [
      { dimensions: [42, true], value: 7 },
      { dimensions: [null, false], value: '9007199254740993' },
      { dimensions: [0, null], value: null },
    ];
    expect(
      formatted.map((group) => ({
        dimensions: group.groupByDimensionValues,
        value: group.aggregate,
      })),
    ).toEqual(expected);
  });
  const run = async (
    sourceCount: number,
    operation: AggregateOperations,
    distinct = false,
  ) => {
    const runner = new CommonGroupByQueryRunnerService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    Object.assign(runner, {
      groupByArgProcessor: {
        validateAndTransformGroupByFieldsOrThrow: () => [
          { fieldMetadata: { name: 'status', type: FieldMetadataType.TEXT } },
        ],
      },
    });
    let limit = 0;
    const selections: [string, string][] = [];
    const events: string[] = [];
    const builder = {
      select: jest.fn(),
      addSelect: jest.fn((expression, alias) => {
        selections.push([expression, alias]);
      }),
      groupBy: jest.fn(() => {
        events.push('group');
      }),
      limit: jest.fn((value) => {
        limit = value;
        events.push('limit');
      }),
      getRawMany: jest.fn(async () => {
        expect(events).toEqual(['group', 'limit']);
        const groups = new Map<string, bigint>();
        for (let i = 0; i < sourceCount; i++) {
          const key = distinct ? String(i) : 'same';
          groups.set(
            key,
            (groups.get(key) ?? BigInt(0)) +
              (operation === AggregateOperations.COUNT
                ? BigInt(1)
                : BigInt(1000000)),
          );
        }
        const dimensionAlias = selections[1][1];
        return [...groups].slice(0, limit).map(([key, value]) => ({
          [dimensionAlias]: key,
          aggregate: value.toString(),
        }));
      }),
    };
    Object.assign(builder, { clone: jest.fn(() => builder) });
    const output = await runner.run(
      {
        limit: 201,
        groupBy: [{ status: true }],
        filter: { status: { isNotNull: true } },
        selectedFieldsResult: {
          aggregate: {
            aggregate: {
              fromField:
                operation === AggregateOperations.COUNT ? 'id' : 'amount',
              aggregateOperation: operation,
              ...(operation === AggregateOperations.SUM
                ? {
                    fromSubFields: ['amountMicros'],
                    subFieldForNumericOperation: 'amountMicros',
                  }
                : {}),
            },
          },
        },
      } as never,
      {
        repository: { createQueryBuilder: () => builder },
        flatObjectMetadata: { nameSingular: 'company', isCustom: true },
        authContext: { workspace: { id: 'workspace' } },
        commonQueryParser: {
          applyFilterToBuilder: jest.fn(),
          applyDeletedAtToBuilder: jest.fn(),
          applyGroupByOrderToBuilder: jest.fn(),
        },
      } as never,
    );
    expect(builder.limit).toHaveBeenCalledWith(201);
    expect(selections[0][0]).toContain(
      operation === AggregateOperations.COUNT ? 'COUNT(' : 'SUM(',
    );
    if (operation === AggregateOperations.SUM)
      expect(selections[0][0]).toContain('amountAmountMicros');
    return output;
  };

  it.each([201, 400, 401])(
    'counts every matching source row, not the first page (%i)',
    async (count) => {
      const output = await run(count, AggregateOperations.COUNT);
      expect(output).toHaveLength(1);
      expect(output[0].aggregate).toBe(String(count));
    },
  );
  it('keeps the cap+1 group probe intact through native getGroupLimit', async () => {
    expect(await run(401, AggregateOperations.COUNT, true)).toHaveLength(201);
  });
  it('keeps money in amountMicros without numeric coercion', async () => {
    expect((await run(401, AggregateOperations.SUM))[0].aggregate).toBe(
      '401000000',
    );
  });
});
