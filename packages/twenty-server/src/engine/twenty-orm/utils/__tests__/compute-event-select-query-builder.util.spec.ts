import { computeEventSelectQueryBuilder } from '../compute-event-select-query-builder.util';
import { WorkspaceSelectQueryBuilder } from '../../repository/workspace-select-query-builder';

jest.mock('../../repository/workspace-select-query-builder', () => ({
  WorkspaceSelectQueryBuilder: jest.fn().mockImplementation(() => ({
    expressionMap: { selects: [], wheres: [], mainAlias: { name: 'widget' } },
    setParameters: jest.fn(),
    select: jest.fn(),
    whereInIds: jest.fn(),
  })),
}));

describe('event selector after a guard rotation', () => {
  const oldGuard = [{ condition: 'guard = old' }];
  const permissions = {
    widget: { restrictedFields: { secret: { canRead: false } } },
  };
  const args = {
    queryBuilder: {},
    authContext: { workspace: { id: 'workspace' } },
    internalContext: { workspaceId: 'workspace' },
    featureFlagMap: {},
    expressionMap: {
      wheres: oldGuard,
      aliases: [],
      parameters: { guard: 'old' },
      returning: ['id', 'value'],
      mainAlias: { name: 'widget' },
    },
    objectRecordsPermissions: permissions,
  };
  it('creates a fresh permission-aware selector for actual returned IDs and selected fields', () => {
    const selector = computeEventSelectQueryBuilder({
      ...args,
      conditionalRecordIds: ['returned-id'],
    } as never);
    const calls = (WorkspaceSelectQueryBuilder as unknown as jest.Mock).mock
      .calls;
    expect(calls[calls.length - 1]).toEqual([
      args.queryBuilder,
      permissions,
      args.internalContext,
      false,
      args.authContext,
      args.featureFlagMap,
    ]);
    expect(selector.whereInIds).toHaveBeenCalledWith(['returned-id']);
    expect(selector.select).toHaveBeenCalledWith(['widget.id', 'widget.value']);
    expect(args.expressionMap.wheres).toBe(oldGuard);
  });
  it('retains legacy event-selector behavior without conditional IDs', () => {
    const selector = computeEventSelectQueryBuilder(args as never);
    const calls = (WorkspaceSelectQueryBuilder as unknown as jest.Mock).mock
      .calls;
    expect(calls[calls.length - 1][3]).toBe(true);
    expect(selector.whereInIds).not.toHaveBeenCalled();
    expect(selector.expressionMap.wheres).toBe(oldGuard);
  });
});
