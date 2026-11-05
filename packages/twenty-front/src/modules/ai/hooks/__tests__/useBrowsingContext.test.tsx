import { renderHook } from '@testing-library/react';
import { useGetBrowsingContext } from '@/ai/hooks/useBrowsingContext';
import { getViewType } from '@/context-store/utils/getViewType';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { type View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';

const get = jest.fn();
jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useStore: () => ({ get }),
}));

it('distinguishes the native Timeline context from Table', () => {
  expect(
    getViewType({
      isRecordIndexPage: true,
      view: { type: ViewType.TIMELINE } as View,
    }),
  ).toBe('timeline');
});

it.each(['timeline', ContextStoreViewType.Table, ContextStoreViewType.Kanban])(
  'retains list-view browsing context for %s',
  (viewType) => {
    get
      .mockReset()
      .mockReturnValueOnce('index')
      .mockReturnValueOnce(viewType)
      .mockReturnValueOnce('tasks')
      .mockReturnValueOnce([
        {
          id: 'tasks',
          nameSingular: 'task',
          fields: [{ id: 'status', label: 'Status' }],
        },
      ])
      .mockReturnValueOnce('saved-view')
      .mockReturnValueOnce({ id: 'saved-view', name: 'Planning' })
      .mockReturnValueOnce([
        { fieldMetadataId: 'status', operand: 'is', displayValue: 'Open' },
      ]);
    const { result } = renderHook(() => useGetBrowsingContext());
    expect(result.current.getBrowsingContext()).toEqual({
      type: 'listView',
      objectNameSingular: 'task',
      viewId: 'saved-view',
      viewName: 'Planning',
      filterDescriptions: ['Status is "Open"'],
    });
  },
);
