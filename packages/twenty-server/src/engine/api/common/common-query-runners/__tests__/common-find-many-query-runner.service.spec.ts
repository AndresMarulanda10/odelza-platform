import { FieldMetadataType, OrderByDirection } from 'twenty-shared/types';
import { CommonFindManyQueryRunnerService } from '../common-find-many-query-runner.service';
import { GraphqlQueryOrderFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';

// Real native runner, ordering parser, cursor encoder and cursor predicate helpers.
// Only the SQL transport is simulated; these tests are not database integration tests.
describe('native bounded record pages', () => {
  const field = { id: 'id-field', name: 'id', type: FieldMetadataType.UUID };
  const object = { nameSingular: 'item', fieldIds: ['id-field'] };
  const fields = {
    universalIdentifierById: { 'id-field': 'id-field' },
    byUniversalIdentifier: { 'id-field': field },
  };
  const parser = new GraphqlQueryOrderFieldParser(
    object as never,
    {} as never,
    fields as never,
  );

  const makeHarness = (size: number) => {
    const rows = Array.from({ length: size }, (_, index) => ({
      id: String(index + 1).padStart(8, '0'),
    }));
    let predicate: { or?: { id?: { gt?: string; lt?: string } }[] } = {};
    let descending = false;
    let limit = 0;
    let offset = 0;
    const builder = {
      clone: () => builder,
      select: () => builder,
      skip: (value: number) => {
        offset = value;
        return builder;
      },
      take: (value: number) => {
        limit = value;
        return builder;
      },
      setFindOptions: () => builder,
      getMany: async () => {
        const condition = predicate.or?.[0]?.id;
        const filtered = rows.filter(
          (row) =>
            (!condition?.gt || row.id > condition.gt) &&
            (!condition?.lt || row.id < condition.lt),
        );
        return (descending ? filtered.reverse() : filtered).slice(
          offset,
          offset + limit,
        );
      },
    };
    const runner = new CommonFindManyQueryRunnerService();
    const run = (after?: string, orderBy?: unknown) =>
      runner.run(
        {
          first: 200,
          after,
          orderBy,
          selectedFieldsResult: {
            select: { id: true },
            aggregate: {},
            relations: undefined,
          },
        } as never,
        {
          repository: { createQueryBuilder: () => builder },
          flatObjectMetadata: object,
          flatObjectMetadataMaps: {},
          flatFieldMetadataMaps: fields,
          commonQueryParser: {
            applyFilterToBuilder: (
              _builder: unknown,
              _name: string,
              filter: typeof predicate,
            ) => {
              predicate = filter;
            },
            applyDeletedAtToBuilder: () => {},
            applyOrderToBuilder: (_builder: unknown, order: never) => {
              const parsed = parser.parse(order, 'item');
              descending = Object.values(parsed.orderBy)[0].order === 'DESC';
              return parsed.orderBy;
            },
            addRelationOrderColumnsToBuilder: () => {},
          },
        } as never,
      );
    return { run };
  };

  it.each([201, 400, 401])(
    'covers %i records exactly once with native cursors',
    async (size) => {
      const { run } = makeHarness(size);
      const ids: string[] = [];
      let after: string | undefined;
      for (let pageIndex = 0; pageIndex < 4; pageIndex++) {
        const page = await run(after);
        expect(page.records.length).toBeLessThanOrEqual(200);
        ids.push(...page.records.map((record) => record.id));
        if (!page.pageInfo.hasNextPage) break;
        after = page.pageInfo.endCursor ?? undefined;
      }
      expect(ids).toHaveLength(size);
      expect(new Set(ids).size).toBe(size);
    },
  );

  it('keeps descending ID SQL ordering consistent with cursor predicates', async () => {
    const { run } = makeHarness(401);
    const order = [{ id: OrderByDirection.DescNullsLast }];
    const first = await run(undefined, order);
    expect(first.records[0].id).toBe('00000401');
    const second = await run(first.pageInfo.endCursor ?? undefined, order);
    expect(second.records[0].id).toBe('00000201');
    expect(
      new Set([...first.records, ...second.records].map((record) => record.id))
        .size,
    ).toBe(400);
  });
});
