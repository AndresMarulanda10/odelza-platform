import { act, renderHook } from '@testing-library/react';
import { indigo } from '@radix-ui/colors';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { useSaveRecordTableWidgetViews } from '@/page-layout/hooks/useSaveRecordTableWidgetViews';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { type PageLayout } from '@/page-layout/types/PageLayout';

const mockUpsert = jest.fn(async () => ({ data: {} }));
jest.mock('@apollo/client/react', () => ({ useMutation: () => [mockUpsert] }));
jest.mock('@/object-metadata/states/objectMetadataItemsSelector', () => {
  const { atom } = jest.requireActual('jotai');
  return { objectMetadataItemsSelector: { atom: atom([]) } };
});

it.each([
  {
    barColor: indigo.indigo9,
    startDateFieldMetadataUniversalIdentifier: 'start',
    endDateFieldMetadataUniversalIdentifier: 'end',
    __typename: 'ViewTimelineConfiguration',
  },
  null,
])(
  'saves private configuration %j together with unchanged fields, filters and sorts',
  async (timelineConfiguration) => {
    mockUpsert.mockClear();
    const store = createStore();
    const snapshot = {
      view: {
        id: 'private',
        objectMetadataId: 'company',
        timelineConfiguration,
      },
      viewFields: [
        { fieldMetadataId: 'name', isVisible: true, position: 0, size: 150 },
      ],
      viewFilters: [],
      viewFilterGroups: [],
      viewSorts: [],
    } as unknown as RecordTableWidgetViewSnapshot;
    store.set(
      pageLayoutDraftComponentState.atomFamily({ instanceId: 'layout' }),
      {
        tabs: [
          {
            widgets: [
              {
                id: 'widget',
                type: 'RECORD_TABLE',
                configuration: {
                  configurationType: 'RECORD_TABLE',
                  viewId: 'private',
                  presentationMode: 'TIMELINE',
                  recordLimit: 5,
                },
              },
            ],
          },
        ],
      } as unknown as PageLayout,
    );
    store.set(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: 'layout',
      }),
      { widget: snapshot },
    );
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useSaveRecordTableWidgetViews(), {
      wrapper,
    });
    await act(async () => result.current.saveRecordTableWidgetViews('layout'));
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    const input = (
      mockUpsert.mock.calls[0] as unknown as [
        { variables: { input: Record<string, unknown> } },
      ]
    )[0].variables.input;
    expect(input).toMatchObject({
      widgetId: 'widget',
      viewFields: [
        { fieldMetadataId: 'name', isVisible: true, position: 0, size: 150 },
      ],
      viewFilters: [],
      viewFilterGroups: [],
      viewSorts: [],
      timelineConfiguration:
        timelineConfiguration === null
          ? null
          : {
              barColor: indigo.indigo9,
              startDateFieldMetadataUniversalIdentifier: 'start',
              endDateFieldMetadataUniversalIdentifier: 'end',
            },
    });
    expect(JSON.stringify(input)).not.toContain('__typename');
    expect(
      store.get(
        recordTableWidgetViewPersistedComponentState.atomFamily({
          instanceId: 'layout',
        }),
      ).widget.view.timelineConfiguration,
    ).toEqual(timelineConfiguration);
  },
);
