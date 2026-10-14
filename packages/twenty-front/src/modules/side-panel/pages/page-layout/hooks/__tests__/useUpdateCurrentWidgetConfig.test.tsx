import { act, renderHook } from '@testing-library/react';
import { Provider, atom, createStore } from 'jotai';
import { type ReactNode } from 'react';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { convertPageLayoutDraftToUpdateInput } from '@/page-layout/utils/convertPageLayoutDraftToUpdateInput';
import { emptyTimelineMapping } from '@/page-layout/widgets/task-timeline/utils/timelineSource';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState',
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue');

const color = `#${['12', '34', '56'].join('')}`;
const draft = {
  id: 'layout',
  name: 'Dashboard',
  type: 'DASHBOARD',
  objectMetadataId: null,
  tabs: [
    {
      id: 'tab',
      title: 'Timeline',
      position: 0,
      isActive: true,
      layoutMode: 'GRID',
      widgets: [
        {
          id: 'timeline',
          type: 'TASK_TIMELINE',
          title: 'Timeline',
          pageLayoutTabId: 'tab',
          objectMetadataId: 'task-object',
          gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
          configuration: {
            configurationType: 'TASK_TIMELINE',
            __typename: 'TaskTimelineConfiguration',
            fieldMapping: {
              startDateFieldMetadataId: 'task-start',
              dueDateFieldMetadataId: 'task-due',
              dependencyFieldMetadataId: 'old-dependency',
            },
            barColor: color,
          },
        },
        { id: 'unrelated', objectMetadataId: 'other' },
      ],
    },
  ],
} as unknown as DraftPageLayout;

describe('widget draft updates and real layout save-input conversion', () => {
  function setup() {
    const state = atom(draft);
    const store = createStore();
    jest
      .mocked(useAtomComponentStateCallbackState)
      .mockReturnValue(state as never);
    jest
      .mocked(useAtomComponentStateValue)
      .mockReturnValue('timeline' as never);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(
      () => useUpdateCurrentWidgetConfig('layout'),
      { wrapper },
    );
    return { store, state, update: result.current.updateCurrentWidgetConfig };
  }

  it('preserves omitted source, clears explicit null, and leaves unrelated widgets unchanged', () => {
    const { store, state, update } = setup();
    act(() => update({ configToUpdate: { barColor: color } }));
    expect(store.get(state).tabs[0].widgets[0].objectMetadataId).toBe(
      'task-object',
    );
    act(() =>
      update({
        objectMetadataId: null,
        configToUpdate: { fieldMapping: emptyTimelineMapping() },
      }),
    );
    expect(store.get(state).tabs[0].widgets[0].objectMetadataId).toBeNull();
    expect(store.get(state).tabs[0].widgets[1]).toBe(draft.tabs[0].widgets[1]);
  });

  it('round-trips generic source and distinct fields through the actual persisted save-input converter', () => {
    const { store, state, update } = setup();
    act(() =>
      update({
        objectMetadataId: 'project-object',
        configToUpdate: { fieldMapping: emptyTimelineMapping() },
      }),
    );
    act(() =>
      update({
        configToUpdate: {
          fieldMapping: {
            ...emptyTimelineMapping(),
            titleFieldMetadataId: 'project-caption',
            startDateFieldMetadataId: 'project-kickoff',
            dueDateFieldMetadataId: 'project-delivery',
          },
        },
      }),
    );
    const configured = store.get(state);
    // Use one real widget: the deliberately minimal unrelated sentinel has no
    // position/configuration and is only used to prove update isolation above.
    const input = convertPageLayoutDraftToUpdateInput({
      ...configured,
      tabs: [
        { ...configured.tabs[0], widgets: [configured.tabs[0].widgets[0]] },
      ],
    });
    const persisted = JSON.parse(JSON.stringify(input.tabs![0].widgets![0]));
    expect(persisted).toMatchObject({
      objectMetadataId: 'project-object',
      configuration: {
        configurationType: 'TASK_TIMELINE',
        barColor: color,
        fieldMapping: {
          titleFieldMetadataId: 'project-caption',
          startDateFieldMetadataId: 'project-kickoff',
          dueDateFieldMetadataId: 'project-delivery',
          dependencyFieldMetadataId: null,
        },
      },
    });
    const reloaded = { ...configured.tabs[0].widgets[0], ...persisted };
    expect(reloaded.configuration.fieldMapping).toEqual(
      configured.tabs[0].widgets[0].configuration &&
        (
          configured.tabs[0].widgets[0].configuration as {
            fieldMapping: object;
          }
        ).fieldMapping,
    );
    expect(reloaded.objectMetadataId).toBe('project-object');
  });
});
