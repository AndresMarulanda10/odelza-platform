import { useCachedMetadata } from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';

describe('metadata response cache variables', () => {
  const makeHarness = () => {
    const cache = new Map<string, unknown>();
    const cacheGetter = jest.fn((key: string) => cache.get(key));
    const cacheSetter = jest.fn((key: string, value: unknown) =>
      cache.set(key, value),
    );
    const plugin = useCachedMetadata({
      operationsToCache: ['FindAllViews', 'ObjectMetadataItems'],
      cacheGetter,
      cacheSetter,
    }) as unknown as {
      onRequest: (args: {
        serverContext: unknown;
        endResponse: jest.Mock;
      }) => Promise<unknown>;
      onResponse: (args: {
        serverContext: unknown;
        response: Response;
      }) => Promise<void>;
    };
    const context = (variables: unknown, overrides = {}) => ({
      req: {
        workspace: { id: 'workspace', metadataVersion: 1 },
        userWorkspaceId: 'member',
        locale: 'en',
        body: {
          operationName: 'FindAllViews',
          query:
            'query FindAllViews($viewTypes: [ViewType!]) { getViews(viewTypes: $viewTypes) { id } }',
          variables,
        },
        ...overrides,
      },
    });
    return { plugin, context, cacheGetter, cacheSetter };
  };

  it('does not return a response cached for a different view-type filter', async () => {
    const { plugin, context } = makeHarness();
    const previous = context({ viewTypes: ['TABLE', 'KANBAN', 'CALENDAR'] });
    const timeline = context({
      viewTypes: ['TABLE', 'KANBAN', 'CALENDAR', 'TIMELINE'],
    });
    await plugin.onResponse({
      serverContext: previous,
      response: Response.json({ data: { getViews: [{ id: 'table' }] } }),
    });
    const endResponse = jest.fn();
    await plugin.onRequest({ serverContext: timeline, endResponse });
    expect(endResponse).not.toHaveBeenCalled();
    await plugin.onResponse({
      serverContext: timeline,
      response: Response.json({
        data: { getViews: [{ id: 'table' }, { id: 'timeline' }] },
      }),
    });
    await plugin.onRequest({ serverContext: timeline, endResponse });
    expect(await (endResponse.mock.calls[0][0] as Response).json()).toEqual({
      data: { getViews: [{ id: 'table' }, { id: 'timeline' }] },
    });
  });

  it('reuses equivalent variables regardless of object-key order, preserving array order', async () => {
    const { plugin, context } = makeHarness();
    const first = context({
      filter: { a: 1, b: 2 },
      viewTypes: ['TABLE', 'TIMELINE'],
    });
    await plugin.onResponse({
      serverContext: first,
      response: Response.json({ data: { getViews: [] } }),
    });
    const endResponse = jest.fn();
    await plugin.onRequest({
      serverContext: context({
        viewTypes: ['TABLE', 'TIMELINE'],
        filter: { b: 2, a: 1 },
      }),
      endResponse,
    });
    expect(endResponse).toHaveBeenCalledTimes(1);
    endResponse.mockClear();
    await plugin.onRequest({
      serverContext: context({
        filter: { a: 1, b: 2 },
        viewTypes: ['TIMELINE', 'TABLE'],
      }),
      endResponse,
    });
    expect(endResponse).not.toHaveBeenCalled();
  });

  it('preserves member/workspace isolation, error exclusion and operation bypass', async () => {
    const { plugin, context, cacheSetter, cacheGetter } = makeHarness();
    const original = context(undefined);
    await plugin.onResponse({
      serverContext: original,
      response: Response.json({ data: { getViews: [] } }),
    });
    const endResponse = jest.fn();
    await plugin.onRequest({ serverContext: original, endResponse });
    expect(endResponse).toHaveBeenCalledTimes(1);
    endResponse.mockClear();
    for (const overrides of [
      { userWorkspaceId: 'another-member' },
      { workspace: { id: 'another-workspace', metadataVersion: 1 } },
      { workspace: { id: 'workspace', metadataVersion: 2 } },
    ]) {
      await plugin.onRequest({
        serverContext: context(undefined, overrides),
        endResponse,
      });
    }
    expect(endResponse).not.toHaveBeenCalled();
    await plugin.onResponse({
      serverContext: context({ rejected: true }),
      response: Response.json({ errors: [{ message: 'Rejected' }] }),
    });
    expect(cacheSetter).toHaveBeenCalledTimes(1);
    cacheGetter.mockClear();
    await plugin.onRequest({
      serverContext: context(
        {},
        {
          body: {
            operationName: 'Uncached',
            query: 'query Uncached { getViews { id } }',
          },
        },
      ),
      endResponse,
    });
    expect(cacheGetter).not.toHaveBeenCalled();
  });
});
