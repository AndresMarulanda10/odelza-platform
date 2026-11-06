import { WorkspaceUpdateQueryBuilder } from '../workspace-update-query-builder';

describe('conditional WorkspaceUpdateQueryBuilder safety', () => {
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
