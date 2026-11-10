import { WorkspaceUpdateQueryBuilder } from '../workspace-update-query-builder';

describe('conditional WorkspaceUpdateQueryBuilder safety', () => {
  it('refuses an active external transaction before any query or resource ownership change', async () => {
    const queryRunner = {
      isTransactionActive: true,
      query: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };
    const builder = Object.assign(
      Object.create(WorkspaceUpdateQueryBuilder.prototype),
      {
        queryRunner,
      },
    ) as WorkspaceUpdateQueryBuilder<{ id: string }>;
    builder.withConditionalUpdate('11111111-1111-4111-8111-111111111111');
    await expect(builder.execute()).rejects.toThrow(
      'active caller-owned transaction',
    );
    for (const operation of [
      'query',
      'commitTransaction',
      'rollbackTransaction',
      'release',
    ] as const) {
      expect(queryRunner[operation]).not.toHaveBeenCalled();
    }
  });
  it('rejects unsupported fields before preparing nested relations or enriching files', () => {
    const prepareNestedRelationQueries = jest.fn();
    const enrichFilesFields = jest.fn();
    const object = { id: 'widget', nameSingular: 'widget', fieldIds: [] };
    const builder = Object.assign(
      Object.create(WorkspaceUpdateQueryBuilder.prototype),
      {
        expressionMap: { mainAlias: { target: 'widget' } },
        internalContext: {
          objectIdByNameSingular: { widget: 'widget' },
          flatObjectMetadataMaps: {
            universalIdentifierById: { widget: 'widget' },
            byUniversalIdentifier: { widget: object },
          },
          flatFieldMetadataMaps: {
            universalIdentifierById: {},
            byUniversalIdentifier: {},
          },
        },
        _relationNestedQueries: { prepareNestedRelationQueries },
        _filesFieldSync: { enrichFilesFields },
      },
    ) as WorkspaceUpdateQueryBuilder<{ id: string }>;
    builder.withConditionalUpdate();
    expect(() => builder.set({ files: [] } as never)).toThrow(
      'Conditional updates support scalar',
    );
    expect(prepareNestedRelationQueries).not.toHaveBeenCalled();
    expect(enrichFilesFields).not.toHaveBeenCalled();
  });
});
