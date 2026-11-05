jest.mock(
  '@/object-record/record-board/components/RecordBoardContainer',
  () => ({ RecordBoardContainer: () => null }),
);
jest.mock(
  '@/object-record/record-table-widget/components/RecordTableWidgetProvider',
  () => ({ RecordTableWidgetProvider: () => null }),
);
import { act, render } from '@testing-library/react';
import { indigo } from '@radix-ui/colors';
import { useStore } from 'jotai';
import { TimelineViewWidget } from '@/page-layout/widgets/view/components/TimelineViewWidget';
import { anyFieldFilterValueComponentState as search } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState as filters } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import {
  ViewFilterOperand,
  RecordFilterGroupLogicalOperator,
} from 'twenty-shared/types';
import { ViewSortDirection, ViewType } from '~/generated-metadata/graphql';
import { type View } from '@/views/types/View';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
const mockLoads: any[] = [];
let mockStore: ReturnType<typeof useStore>;
jest.mock(
  '@/object-record/record-index/components/RecordIndexTimelineContainer',
  () => ({
    TimelineView: (props: any) => {
      mockStore = useStore();
      mockLoads.push(props);
      return null;
    },
  }),
);
const original = getMockObjectMetadataItemOrThrow('task');
const title = original.fields.find((f) => f.name === 'title')!;
const task = { ...original, fields: [title], readableFields: [title] };
const saved = (value: string): View =>
  ({
    id: 'shared',
    objectMetadataId: task.id,
    viewFields: [],
    viewFilters: [
      {
        id: 'f',
        fieldMetadataId: title.id,
        operand: ViewFilterOperand.CONTAINS,
        value,
        viewFilterGroupId: 'root',
        positionInViewFilterGroup: 0,
      },
    ],
    viewFilterGroups: [
      { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.OR },
    ],
    viewSorts: [
      { id: 's', fieldMetadataId: title.id, direction: ViewSortDirection.DESC },
    ],
    anyFieldFilterValue: 'saved-search',
  }) as unknown as View;
it('S2: public mounts gate every query transition and leave other scopes byte-identical', () => {
  const wrapper = getJestMetadataAndApolloMocksWrapper({
    objectMetadataItems: [task, getMockObjectMetadataItemOrThrow('company')],
  });
  const ui = (v: View) => (
    <>
      <TimelineViewWidget widgetId="one" view={v} objectMetadataItem={task} />
      <TimelineViewWidget
        widgetId="two"
        view={saved('second')}
        objectMetadataItem={task}
      />
    </>
  );
  const { rerender } = render(ui(saved('first')), { wrapper });
  const latest = (id: string) =>
    mockLoads
      .filter((p) => p.instanceId === `view-timeline-widget-${id}`)
      .at(-1);
  expect(latest('one').query).toEqual({
    objectNameSingular: 'task',
    filter: {
      and: [
        { or: [{ title: { ilike: '%first%' } }] },
        { or: [{ title: { ilike: '%saved-search%' } }] },
      ],
    },
    orderBy: [{ title: 'DescNullsLast' }],
  });
  const other = JSON.stringify(
    mockStore.get(
      search.atomFamily({ instanceId: 'view-timeline-widget-two' }),
    ),
  );
  const native = JSON.stringify(
    mockStore.get(filters.atomFamily({ instanceId: 'tasks-shared' })),
  );
  act(() =>
    mockStore.set(
      search.atomFamily({ instanceId: 'view-timeline-widget-one' }),
      'local',
    ),
  );
  mockLoads.length = 0;
  rerender(
    ui({
      ...saved('new'),
      timelineConfiguration: { barColor: indigo.indigo9 },
    }),
  );
  expect(
    mockLoads
      .filter((p) => p.instanceId === 'view-timeline-widget-one')
      .every((p) => JSON.stringify(p.query).includes('%new%')),
  ).toBe(true);
  expect(JSON.stringify(latest('one').query)).toContain('%local%');
  mockLoads.length = 0;
  rerender(
    ui({
      ...saved('switch'),
      id: 'different',
      anyFieldFilterValue: 'replacement',
    }),
  );
  expect(
    mockLoads
      .filter((p) => p.instanceId === 'view-timeline-widget-one')
      .every((p) => JSON.stringify(p.query).includes('%replacement%')),
  ).toBe(true);
  act(() =>
    setTestObjectMetadataItemsInMetadataStore(mockStore, [
      {
        ...task,
        fields: [{ ...title, name: 'subject', label: 'Subject' }],
        readableFields: [{ ...title, name: 'subject', label: 'Subject' }],
      },
      getMockObjectMetadataItemOrThrow('company'),
    ]),
  );
  expect(JSON.stringify(latest('one').query)).toContain('subject');
  expect(
    JSON.stringify(
      mockStore.get(
        search.atomFamily({ instanceId: 'view-timeline-widget-two' }),
      ),
    ),
  ).toBe(other);
  expect(
    JSON.stringify(
      mockStore.get(filters.atomFamily({ instanceId: 'tasks-shared' })),
    ),
  ).toBe(native);
});

import { ViewWidgetRendererContent } from '@/page-layout/widgets/view/components/ViewWidgetRendererContent';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
it('S2: real saved-view selector revokes rendering for inactive and mismatched references', () => {
  const flat = {
    ...saved('guarded'),
    type: ViewType.TIMELINE,
    isActive: true,
    name: 'Private planning',
    nameSingular: 'task',
  };
  const wrapper = getJestMetadataAndApolloMocksWrapper({
    objectMetadataItems: [task, getMockObjectMetadataItemOrThrow('company')],
    onInitializeJotaiStore: (store) => {
      mockStore = store;
      store.set(metadataStoreState.atomFamily('views'), {
        current: [flat] as any,
        draft: [],
        status: 'up-to-date',
      });
    },
  });
  const { container } = render(
    <ViewWidgetRendererContent
      objectMetadataId={task.id}
      viewId="shared"
      widgetId="guarded"
    />,
    { wrapper },
  );
  expect(container.textContent).not.toContain('This view is unavailable.');
  for (const change of [
    { isActive: false },
    { objectMetadataId: 'another' },
    { type: ViewType.TABLE },
  ]) {
    mockLoads.length = 0;
    act(() =>
      mockStore.set(metadataStoreState.atomFamily('views'), {
        current: [{ ...flat, ...change }] as any,
        draft: [],
        status: 'up-to-date',
      }),
    );
    expect(container.textContent).toBe('This view is unavailable.');
    expect(container.textContent).not.toContain('Private planning');
    expect(mockLoads).toHaveLength(0);
  }
});
