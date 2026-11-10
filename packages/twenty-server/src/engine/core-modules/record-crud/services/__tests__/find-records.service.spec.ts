import { FindRecordsService } from '../find-records.service';
import { type FindRecordsParams } from '../../types/find-records-params.type';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { GraphqlQueryOrderFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import { buildCursorWhereCondition } from 'src/engine/api/utils/build-cursor-where-condition.utils';

describe('FindRecordsService bounded pagination', () => {
  const pageInfo = {
    hasNextPage: true,
    hasPreviousPage: false,
    startCursor: 'start',
    endCursor: 'end',
  };
  const runner = { execute: jest.fn() };
  const builder = { build: jest.fn() };
  const service = new FindRecordsService(runner as never, builder as never);
  const params = {
    objectName: 'item',
    authContext: { workspace: { id: 'workspace-a' } },
    shouldBuildEffectiveSelectFields: false,
  } as FindRecordsParams;

  beforeEach(() => {
    builder.build.mockResolvedValue({
      queryRunnerContext: { workspace: 'workspace-a' },
      selectedFields: { id: true },
      flatObjectMetadata: { fieldIds: [] },
      flatFieldMetadataMaps: {},
    });
    runner.execute.mockResolvedValue({
      results: { records: [{ id: 'one' }], totalCount: '401', pageInfo },
    });
  });

  it('returns native page metadata and normalizes driver count without counting the page', async () => {
    const output = await service.execute(params);
    expect(output.result).toEqual({
      records: [{ id: 'one' }],
      count: 401,
      pageInfo,
    });
  });

  it.each([NaN, Infinity, -1, 0, 1.5, Number.MAX_SAFE_INTEGER + 1, '10', null])(
    'rejects invalid direct limit %p at runtime',
    async (limit) => {
      runner.execute.mockClear();
      const output = await service.execute({ ...params, limit } as never);
      expect(output.success).toBe(false);
      expect(runner.execute).not.toHaveBeenCalled();
    },
  );

  it('preserves an explicit descending ID without adding another ID order', async () => {
    await service.execute({
      ...params,
      orderBy: [{ id: 'DescNullsLast' }],
    } as never);
    expect(
      runner.execute.mock.calls[runner.execute.mock.calls.length - 1]?.[0]
        .orderBy,
    ).toEqual([{ id: 'DescNullsLast' }]);
  });

  it('rejects cursor combined with nonzero offset', async () => {
    const output = await service.execute({
      ...params,
      after: 'eyJpZCI6Im9uZSJ9',
      offset: 1,
    } as never);
    expect(output.success).toBe(false);
  });

  it.each(['!', 'e30=', 'bnVsbA==', 'W10='])(
    'rejects malformed or incomplete cursor %s',
    async (after) => {
      expect(
        (await service.execute({ ...params, after } as never)).success,
      ).toBe(false);
    },
  );

  it('preserves workflow default 200, cap 200, zero offset, and workspace context', async () => {
    await service.execute(params);
    expect(runner.execute).toHaveBeenLastCalledWith(
      expect.objectContaining({
        first: 200,
        offset: 0,
        selectedFields: { id: true, totalCount: true },
      }),
      { workspace: 'workspace-a' },
    );
    await service.execute({ ...params, limit: 401 });
    expect(
      runner.execute.mock.calls[runner.execute.mock.calls.length - 1]?.[0]
        .first,
    ).toBe(200);
    expect(builder.build).toHaveBeenLastCalledWith({
      authContext: params.authContext,
      objectName: 'item',
    });
  });

  it('fails closed on native relation cursor ordering', async () => {
    const relation = {
      id: 'relation',
      name: 'parent',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.MANY_TO_ONE },
    };
    builder.build.mockResolvedValue({
      queryRunnerContext: {},
      selectedFields: { id: true, parent: true },
      flatObjectMetadata: { fieldIds: ['relation'] },
      flatFieldMetadataMaps: {
        universalIdentifierById: { relation: 'relation' },
        byUniversalIdentifier: { relation },
      },
    });
    const output = await service.execute({
      ...params,
      after: 'eyJpZCI6Im9uZSJ9',
      orderBy: [{ parent: { id: 'AscNullsFirst' } }],
    } as never);
    expect(output.success).toBe(false);
    expect(output.error).toContain('relation ordering');
  });

  it('does not widen restricted selections for cursor generation', async () => {
    builder.build.mockResolvedValue({
      queryRunnerContext: {},
      selectedFields: { id: true },
      flatObjectMetadata: { fieldIds: [] },
      flatFieldMetadataMaps: {},
    });
    const after = Buffer.from(
      JSON.stringify({ id: 'one', secret: 'value' }),
    ).toString('base64');
    const output = await service.execute({
      ...params,
      after,
      orderBy: [{ secret: 'AscNullsFirst' }],
    } as never);
    expect(output.success).toBe(false);
  });

  it('retains the permission-aware field mask and warnings for explicit selections', async () => {
    const output = await service.execute({
      ...params,
      shouldBuildEffectiveSelectFields: true,
      select: ['id', 'secret'],
    });
    expect(output.success).toBe(true);
    expect(output.warnings).toEqual(["Field 'secret' not found on item."]);
    expect(runner.execute).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selectedFields: { id: true, totalCount: true },
      }),
      { workspace: 'workspace-a' },
    );
  });

  it('builds an independent context for each workspace', async () => {
    for (const workspaceId of ['workspace-a', 'workspace-b']) {
      const authContext = { workspace: { id: workspaceId } };
      builder.build.mockResolvedValue({
        queryRunnerContext: { authContext },
        selectedFields: { id: true },
        flatObjectMetadata: { fieldIds: [] },
        flatFieldMetadataMaps: {},
      });
      await service.execute({ ...params, authContext } as never);
      expect(builder.build).toHaveBeenLastCalledWith({
        authContext,
        objectName: 'item',
      });
      expect(runner.execute).toHaveBeenLastCalledWith(expect.anything(), {
        authContext,
      });
    }
  });

  it('propagates permission rejection without executing a read', async () => {
    builder.build.mockRejectedValue(new Error('Object permission denied'));
    runner.execute.mockClear();
    expect((await service.execute(params)).success).toBe(false);
    expect(runner.execute).not.toHaveBeenCalled();
  });

  it.each(['9007199254740992', 'not-a-count', null])(
    'rejects unrepresentable matching count %p instead of reporting page size',
    async (totalCount) => {
      runner.execute.mockResolvedValue({
        results: { records: [], totalCount, pageInfo },
      });
      expect((await service.execute(params)).success).toBe(false);
    },
  );

  it('passes a valid native cursor through without changing its contents', async () => {
    const after = Buffer.from(JSON.stringify({ id: 'one' })).toString('base64');
    expect((await service.execute({ ...params, after })).success).toBe(true);
    expect(runner.execute).toHaveBeenLastCalledWith(
      expect.objectContaining({ after, offset: 0 }),
      { workspace: 'workspace-a' },
    );
  });

  it('rejects contradictory explicit ID ordering', async () => {
    expect(
      (
        await service.execute({
          ...params,
          orderBy: [{ id: 'AscNullsFirst' }, { id: 'DescNullsLast' }],
        } as never)
      ).success,
    ).toBe(false);
  });

  it.each([-1, 0.5, NaN, '1', null, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid direct offset %p',
    async (offset) => {
      expect(
        (await service.execute({ ...params, offset } as never)).success,
      ).toBe(false);
    },
  );
});

describe('FindRecordsService consistent recursive ordering paths', () => {
  const metadataFields = [
    { id: 'id-field', name: 'id', type: FieldMetadataType.UUID },
    { id: 'rank-field', name: 'rank', type: FieldMetadataType.NUMBER },
    { id: 'label-field', name: 'label', type: FieldMetadataType.FULL_NAME },
  ];
  const object = {
    nameSingular: 'item',
    fieldIds: metadataFields.map((field) => field.id),
  };
  const fields = {
    universalIdentifierById: Object.fromEntries(
      metadataFields.map((field) => [field.id, field.id]),
    ),
    byUniversalIdentifier: Object.fromEntries(
      metadataFields.map((field) => [field.id, field]),
    ),
  };
  const parser = new GraphqlQueryOrderFieldParser(
    object as never,
    {} as never,
    fields as never,
  );
  const cursorCondition = (
    orderBy: unknown,
    cursorKey: string,
    cursorValue: unknown,
  ) =>
    buildCursorWhereCondition({
      orderBy,
      cursorKey,
      cursorValue,
      flatObjectMetadata: object,
      flatFieldMetadataMaps: fields,
      isForwardPagination: true,
    } as never);
  const runner = {
    execute: jest.fn(async ({ orderBy }) => {
      // Exercise the actual SQL ordering parser and cursor helper on accepted inputs.
      parser.parse(orderBy, 'item');
      for (const fieldName of ['rank', 'label']) {
        if (
          orderBy.some((entry: Record<string, unknown>) => fieldName in entry)
        ) {
          cursorCondition(
            orderBy,
            fieldName,
            fieldName === 'rank' ? null : { firstName: null },
          );
        }
      }
      return {
        results: {
          records: [],
          totalCount: 0,
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
        },
      };
    }),
  };
  const service = new FindRecordsService(
    runner as never,
    {
      build: async () => ({
        queryRunnerContext: {},
        selectedFields: {
          id: true,
          rank: true,
          label: { firstName: true, lastName: true },
        },
        flatObjectMetadata: object,
        flatFieldMetadataMaps: fields,
      }),
    } as never,
  );
  const read = (orderBy: unknown) =>
    service.execute({
      objectName: 'item',
      authContext: { workspace: { id: 'workspace-a' } },
      shouldBuildEffectiveSelectFields: false,
      orderBy,
    } as never);

  it('demonstrates the native scalar parser/cursor direction disagreement', () => {
    const order = [{ rank: 'AscNullsFirst' }, { rank: 'DescNullsLast' }];
    expect(
      Object.values(parser.parse(order as never, 'item').orderBy)[0],
    ).toMatchObject({ order: 'DESC', nulls: 'NULLS LAST' });
    expect(cursorCondition(order, 'rank', 5)).toEqual({ rank: { gt: 5 } });
  });

  it.each([
    [{ rank: 'AscNullsFirst' }, { rank: 'DescNullsLast' }],
    [{ rank: 'AscNullsFirst' }, { rank: 'AscNullsLast' }],
    [
      { label: { firstName: 'AscNullsFirst' } },
      { label: { firstName: 'DescNullsLast' } },
    ],
    [
      { label: { firstName: 'AscNullsFirst' } },
      { label: { firstName: 'AscNullsLast' } },
    ],
    [
      { parent: { owner: { label: { lastName: 'AscNullsLast' } } } },
      { parent: { owner: { label: { lastName: 'DescNullsLast' } } } },
    ],
  ])(
    'rejects conflicting sort paths before query execution: %p',
    async (...order) => {
      runner.execute.mockClear();
      const output = await read(order);
      expect(output.success).toBe(false);
      expect(output.error).toContain('Conflicting order directions');
      expect(runner.execute).not.toHaveBeenCalled();
    },
  );

  it.each(['AscNullsFirst', 'AscNullsLast', 'DescNullsFirst', 'DescNullsLast'])(
    'preserves equivalent duplicates, composite subpaths, null cursors and explicit ID %s',
    async (direction) => {
      const order = [
        { rank: direction },
        { rank: direction },
        { label: { firstName: direction } },
        { label: { firstName: direction, lastName: direction } },
        { id: direction },
        { id: direction },
      ];
      const output = await read(order);
      expect(output.success).toBe(true);
      const parsed = Object.values(
        parser.parse(order as never, 'item').orderBy,
      );
      expect(parsed).toHaveLength(4);
      for (const item of parsed) {
        expect(item).toMatchObject({
          order: direction.startsWith('Asc') ? 'ASC' : 'DESC',
          nulls: direction.endsWith('First') ? 'NULLS FIRST' : 'NULLS LAST',
        });
      }
      const operator = direction.startsWith('Asc') ? 'gt' : 'lt';
      expect(cursorCondition(order, 'rank', null)).toEqual({
        rank: { [operator]: null },
      });
      expect(cursorCondition(order, 'label', { firstName: null })).toEqual({
        label: { firstName: { [operator]: null } },
      });
      expect(cursorCondition(order, 'id', 'one')).toEqual({
        id: { [operator]: 'one' },
      });
    },
  );

  it('exercises composite parser/helper precedence while rejecting an ambiguous request', async () => {
    const order = [
      { label: { firstName: 'AscNullsFirst' } },
      { label: { firstName: 'DescNullsLast' } },
    ];
    expect(
      Object.values(parser.parse(order as never, 'item').orderBy)[0],
    ).toMatchObject({ order: 'DESC', nulls: 'NULLS LAST' });
    expect(cursorCondition(order, 'label', { firstName: 'A' })).toEqual({
      label: { firstName: { lt: 'A' } },
    });
    expect((await read(order)).success).toBe(false);
  });
});
