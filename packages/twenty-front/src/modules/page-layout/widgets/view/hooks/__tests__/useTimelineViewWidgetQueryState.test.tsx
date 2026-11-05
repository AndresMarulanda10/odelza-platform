import { act, renderHook } from '@testing-library/react';
import { useStore } from 'jotai';
import { useTimelineViewWidgetQueryState } from '@/page-layout/widgets/view/hooks/useTimelineViewWidgetQueryState';
import { useFindManyTimelineViewParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { type View } from '@/views/types/View';
import { ViewFilterOperand } from 'twenty-shared/types';
import { ViewSortDirection, ViewType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const original = getMockObjectMetadataItemOrThrow('task');
const title = original.fields.find((field) => field.name === 'title')!;
const task = { ...original, fields: [title], readableFields: [title] };
const view = {
  id: 'planning',
  objectMetadataId: task.id,
  type: ViewType.TIMELINE,
  viewFields: [],
  viewFilterGroups: [],
  viewFilters: [
    {
      id: 'f',
      fieldMetadataId: title.id,
      operand: ViewFilterOperand.CONTAINS,
      value: 'saved',
    },
  ],
  viewSorts: [
    { id: 's', fieldMetadataId: title.id, direction: ViewSortDirection.ASC },
  ],
  anyFieldFilterValue: 'needle',
} as unknown as View;
const search = (instanceId: string) =>
  anyFieldFilterValueComponentState.atomFamily({ instanceId });

it('initializes zero-field scopes using real parsers without touching another widget or native state', () => {
  const wrapper = getJestMetadataAndApolloMocksWrapper({
    objectMetadataItems: [task, getMockObjectMetadataItemOrThrow('company')],
  });
  const readyOnRender: boolean[] = [];
  const { result, rerender } = renderHook(
    ({ saved }) => {
      const ready = useTimelineViewWidgetQueryState(
        saved,
        task,
        'view-timeline-widget-a',
      );
      useTimelineViewWidgetQueryState(view, task, 'view-timeline-widget-b');
      readyOnRender.push(ready);
      return {
        ready,
        store: useStore(),
        query: useFindManyTimelineViewParams('task', 'view-timeline-widget-a'),
      };
    },
    { wrapper, initialProps: { saved: view } },
  );
  expect(readyOnRender[0]).toBe(false);
  expect(result.current.ready).toBe(true);
  expect(result.current.query).toEqual({
    objectNameSingular: 'task',
    filter: {
      and: [
        { title: { ilike: '%saved%' } },
        { or: [{ title: { ilike: '%needle%' } }] },
      ],
    },
    orderBy: [{ title: 'AscNullsFirst' }],
  });
  expect(result.current.query).not.toHaveProperty('limit');
  const store = result.current.store;
  const nativeFilters = currentRecordFiltersComponentState.atomFamily({
    instanceId: 'tasks-planning',
  });
  const nativeSorts = currentRecordSortsComponentState.atomFamily({
    instanceId: 'tasks-planning',
  });
  const before = [
    store.get(nativeFilters),
    store.get(nativeSorts),
    store.get(recordIndexViewTypeState.atom),
  ];
  act(() => store.set(search('view-timeline-widget-a'), 'local'));
  rerender({
    saved: { ...view, timelineConfiguration: { barColor: '#112233' } },
  });
  expect(store.get(search('view-timeline-widget-a'))).toBe('local');
  rerender({
    saved: {
      ...view,
      viewFilters: [{ ...view.viewFilters[0], value: 'changed' }],
      viewSorts: [{ ...view.viewSorts[0], direction: ViewSortDirection.DESC }],
    },
  });
  expect(result.current.query.filter).toEqual({
    and: [
      { title: { ilike: '%changed%' } },
      { or: [{ title: { ilike: '%local%' } }] },
    ],
  });
  expect(result.current.query.orderBy).toEqual([{ title: 'DescNullsLast' }]);
  expect(store.get(search('view-timeline-widget-b'))).toBe('needle');
  expect(
    store.get(
      contextStoreCurrentViewIdComponentState.atomFamily({
        instanceId: 'view-timeline-widget-a',
      }),
    ),
  ).toBe('planning');
  expect([
    store.get(nativeFilters),
    store.get(nativeSorts),
    store.get(recordIndexViewTypeState.atom),
  ]).toEqual(before);
  rerender({ saved: { ...view, anyFieldFilterValue: null } });
  expect(store.get(search('view-timeline-widget-a'))).toBe('');
  act(() =>
    setTestObjectMetadataItemsInMetadataStore(store, [
      {
        ...task,
        fields: [{ ...title, name: 'subject', label: 'Subject' }],
        readableFields: [{ ...title, name: 'subject', label: 'Subject' }],
      },
      getMockObjectMetadataItemOrThrow('company'),
    ]),
  );
  expect(
    store.get(
      currentRecordFiltersComponentState.atomFamily({
        instanceId: 'view-timeline-widget-a',
      }),
    )[0].label,
  ).toBe('Subject');
  expect(JSON.stringify(result.current.query.filter)).toContain('subject');
  expect(store.get(search('view-timeline-widget-b'))).toBe('needle');
});
