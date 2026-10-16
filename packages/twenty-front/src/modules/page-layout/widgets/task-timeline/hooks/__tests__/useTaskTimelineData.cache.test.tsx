import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { print } from 'graphql';
import { type ReactNode, useState } from 'react';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useTaskTimelineData } from '@/page-layout/widgets/task-timeline/hooks/useTaskTimelineData';
import { TaskTimelineWidget } from '@/page-layout/widgets/task-timeline/components/TaskTimelineWidget';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

jest.mock('@/object-metadata/hooks/useApolloCoreClient');
jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-metadata/hooks/useObjectMetadataItems');
jest.mock('@/object-record/hooks/useObjectPermissions');
jest.mock('@/object-record/hooks/useObjectPermissionsForObject');
jest.mock('@/object-record/hooks/useRefetchAggregateQueries');
jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({ openRecordInSidePanel: jest.fn() }),
}));
jest.mock(
  '@/page-layout/widgets/task-timeline/utils/getTaskTimelineCalendar',
  () => ({
    ...jest.requireActual(
      '@/page-layout/widgets/task-timeline/utils/getTaskTimelineCalendar',
    ),
    getTaskTimelineToday: () => '2026-09-19',
  }),
);
jest.mock('@/object-record/hooks/useHandleFindManyRecordsCompleted', () => ({
  useHandleFindManyRecordsCompleted: () => ({
    handleFindManyRecordsCompleted: () => undefined,
  }),
}));
jest.mock('@/object-record/hooks/useHandleFindManyRecordsError', () => ({
  useHandleFindManyRecordsError: () => ({
    handleFindManyRecordsError: () => undefined,
  }),
}));
jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({ upsertRecordsInStore: () => undefined }),
}));

const original = '2026-09-19';
const requested = '2026-09-21';
const authoritative = '2026-09-22';
const base = getTestEnrichedObjectMetadataItemsMock().find(
  (item) => item.nameSingular === 'task',
)!;
const due = base.fields.find((field) => field.name === 'dueAt')!;
const start = {
  ...due,
  id: 'timeline-start',
  name: 'startDate',
  type: FieldMetadataType.DATE_TIME,
};
const dependency = {
  ...base.fields.find((field) => field.type === FieldMetadataType.RELATION)!,
  id: 'timeline-dependency',
  name: 'dependencies',
  isActive: true,
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.ONE_TO_MANY },
  relation: {
    type: RelationType.ONE_TO_MANY,
    sourceObjectMetadata: {
      id: base.id,
      nameSingular: 'task',
      namePlural: 'tasks',
    },
    sourceFieldMetadata: { id: 'timeline-dependency', name: 'dependencies' },
    targetFieldMetadata: { id: 'timeline-parent', name: 'parent' },
    targetObjectMetadata: {
      id: base.id,
      nameSingular: 'task',
      namePlural: 'tasks',
    },
  },
};
const fields = [
  base.fields.find((field) => field.name === 'id')!,
  start,
  due,
  dependency,
];
const parent = {
  ...dependency,
  id: 'timeline-parent',
  name: 'parent',
  relation: {
    ...dependency.relation,
    type: RelationType.MANY_TO_ONE,
    sourceFieldMetadata: { id: 'timeline-parent', name: 'parent' },
    targetFieldMetadata: { id: dependency.id, name: dependency.name },
  },
  settings: { relationType: RelationType.MANY_TO_ONE },
};
const metadata = {
  ...base,
  fields: [...fields, parent],
  readableFields: fields,
};
const widget = {
  id: 'timeline',
  objectMetadataId: metadata.id,
  configuration: {
    __typename: 'TaskTimelineConfiguration',
    fieldMapping: {
      startDateFieldMetadataId: start.id,
      dueDateFieldMetadataId: due.id,
      dependencyFieldMetadataId: dependency.id,
    },
  },
} as PageLayoutWidget;
let activeMetadata = metadata;
let activeWidget = widget;
let startName = 'startDate';
let endName = 'dueAt';

function Harness() {
  const timeline = useTaskTimelineData(activeWidget);
  const [error, setError] = useState('');
  return (
    <>
      <output data-testid="dates">
        {timeline.items[0]?.startDate} / {timeline.items[0]?.endDate}
      </output>
      <output data-testid="dependencies">
        {timeline.items[0]?.dependencies
          ?.map((item) => item.predecessorId)
          .join(',')}
      </output>
      <button
        onClick={() =>
          void timeline.updateTask!({
            taskId: 'task-1',
            startDate: requested,
          }).catch((failure: Error) => setError(failure.message))
        }
      >
        Edit
      </button>
      <button onClick={timeline.retry}>Retry</button>
      {error && <div role="alert">{error}</div>}
      <TaskTimelineWidget widget={activeWidget} />
    </>
  );
}

describe.each(['task', 'project'])(
  'Timeline %s request/cache integration (real find-many/update hooks)',
  (sourceName) => {
    let client: ApolloClient;
    let operations: string[];
    let rejectMutation: boolean;
    let rejectList: boolean;
    let mutationDocument: string;
    let finishMutation: () => void;
    let mutationInput: Record<string, unknown>;
    const aggregateRefresh = jest.fn();

    beforeEach(() => {
      startName = sourceName === 'task' ? 'startDate' : 'kickoffOn';
      endName = sourceName === 'task' ? 'dueAt' : 'deliveryOn';
      activeMetadata =
        sourceName === 'task'
          ? metadata
          : {
              ...metadata,
              id: 'project-object',
              nameSingular: 'project',
              namePlural: 'projects',
              labelSingular: 'Project',
              labelPlural: 'Projects',
              fields: [
                fields[0],
                {
                  ...start,
                  name: startName,
                  id: 'project-kickoff',
                  objectMetadataId: 'project-object',
                },
                {
                  ...due,
                  name: endName,
                  id: 'project-delivery',
                  objectMetadataId: 'project-object',
                },
              ],
              readableFields: [
                fields[0],
                {
                  ...start,
                  name: startName,
                  id: 'project-kickoff',
                  objectMetadataId: 'project-object',
                },
                {
                  ...due,
                  name: endName,
                  id: 'project-delivery',
                  objectMetadataId: 'project-object',
                },
              ],
            };
      activeWidget =
        sourceName === 'task'
          ? widget
          : ({
              ...widget,
              objectMetadataId: activeMetadata.id,
              configuration: {
                __typename: 'TaskTimelineConfiguration',
                configurationType: 'TASK_TIMELINE',
                fieldMapping: {
                  startDateFieldMetadataId: 'project-kickoff',
                  dueDateFieldMetadataId: 'project-delivery',
                },
              },
            } as PageLayoutWidget);
      operations = [];
      rejectMutation = false;
      rejectList = false;
      mutationDocument = '';
      jest
        .mocked(useObjectMetadataItem)
        .mockReturnValue({ objectMetadataItem: activeMetadata } as ReturnType<
          typeof useObjectMetadataItem
        >);
      jest.mocked(useObjectMetadataItems).mockReturnValue({
        objectMetadataItems: [activeMetadata],
      } as ReturnType<typeof useObjectMetadataItems>);
      jest.mocked(useObjectPermissions).mockReturnValue({
        objectPermissionsByObjectMetadataId: {
          [activeMetadata.id]: {
            objectMetadataId: activeMetadata.id,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            restrictedFields: {},
          },
        },
      } as ReturnType<typeof useObjectPermissions>);
      jest.mocked(useObjectPermissionsForObject).mockReturnValue({
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        restrictedFields: {},
      } as ReturnType<typeof useObjectPermissionsForObject>);
      aggregateRefresh.mockClear();
      jest
        .mocked(useRefetchAggregateQueries)
        .mockReturnValue({ refetchAggregateQueries: aggregateRefresh });
      let persistedStart = original;
      const dependencies = {
        __typename: 'TaskConnection',
        edges: [
          {
            __typename: 'TaskEdge',
            cursor: 'dependency',
            node: { __typename: 'Task', id: 'dependency-1' },
          },
        ],
      };
      client = new ApolloClient({
        // Match the cache construction in useApolloFactory (ApolloCoreProvider).
        cache: new InMemoryCache({
          typePolicies: { RemoteTable: { keyFields: ['name'] } },
        }),
        link: new ApolloLink(
          (operation) =>
            new Observable((observer) => {
              const mutation = operation.query.definitions.some(
                (definition) =>
                  definition.kind === 'OperationDefinition' &&
                  definition.operation === 'mutation',
              );
              const typename = sourceName === 'task' ? 'Task' : 'Project';
              const mutationName = `update${typename}`;
              operations.push(
                mutation ? mutationName : activeMetadata.namePlural,
              );
              if (mutation) {
                mutationDocument = print(operation.query);
                mutationInput = operation.variables.input;
              }
              const record = {
                __typename: typename,
                id: 'task-1',
                [startName]: mutation ? authoritative : persistedStart,
                [endName]: '2026-09-25T00:00:00.000Z',
                ...(mutation && print(operation.query).includes('dependencies')
                  ? { dependencies }
                  : {}),
              };
              const complete = () => {
                if (!mutation && rejectList)
                  observer.error(new Error('List unavailable'));
                else if (mutation && rejectMutation)
                  observer.error(new Error('Save rejected'));
                else {
                  if (mutation) persistedStart = authoritative;
                  observer.next({
                    data: mutation
                      ? { [mutationName]: record }
                      : {
                          [activeMetadata.namePlural]: {
                            __typename: `${typename}Connection`,
                            edges: [
                              {
                                __typename: `${typename}Edge`,
                                cursor: 'one',
                                node:
                                  sourceName === 'task'
                                    ? { ...record, dependencies }
                                    : record,
                              },
                            ],
                            pageInfo: {
                              __typename: 'PageInfo',
                              hasNextPage: false,
                              hasPreviousPage: false,
                              startCursor: 'one',
                              endCursor: 'one',
                            },
                            totalCount: 1,
                          },
                        },
                  });
                }
                observer.complete();
              };
              if (mutation) finishMutation = complete;
              else complete();
            }),
        ),
      });
      jest.mocked(useApolloCoreClient).mockReturnValue(client);
    });

    afterEach(() => client.stop());

    async function mount() {
      const store = createStore();
      setTestObjectMetadataItemsInMetadataStore(store, [activeMetadata]);
      const Wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <ApolloProvider client={client}>{children}</ApolloProvider>
        </Provider>
      );
      render(<Harness />, { wrapper: Wrapper });
      await waitFor(() =>
        expect(screen.getByTestId('dates')).toHaveTextContent(original),
      );
      expect(screen.getByTestId('dependencies')).toHaveTextContent(
        sourceName === 'task' ? 'dependency-1' : '',
      );
      operations.length = 0;
    }

    it.each([false, true])(
      'uses the authoritative mutation response without a second list request (list unavailable: %s)',
      async (listUnavailable) => {
        await mount();
        rejectList = listUnavailable;
        fireEvent.click(screen.getByText('Edit'));
        const mutationName =
          sourceName === 'task' ? 'updateTask' : 'updateProject';
        await waitFor(() => expect(operations).toEqual([mutationName]));
        expect(mutationInput).toEqual({ [startName]: requested });
        await act(async () => finishMutation());
        await waitFor(() =>
          expect(screen.getByTestId('dates')).toHaveTextContent(authoritative),
        );
        expect(operations).toEqual([mutationName]);
        expect(mutationDocument).toContain(startName);
        expect(mutationDocument).toContain(endName);
        expect(mutationDocument).not.toContain('dependencies');
        expect(screen.getByTestId('dependencies')).toHaveTextContent(
          sourceName === 'task' ? 'dependency-1' : '',
        );
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(aggregateRefresh).toHaveBeenCalledTimes(1);
        rejectList = false;
        fireEvent.click(screen.getByText('Retry'));
        await waitFor(() =>
          expect(operations).toEqual([mutationName, activeMetadata.namePlural]),
        );
      },
    );

    it('restores optimistic dates and exposes the mutation error without fetching the list', async () => {
      await mount();
      rejectMutation = true;
      fireEvent.click(screen.getByText('Edit'));
      await waitFor(() =>
        expect(screen.getByTestId('dates')).toHaveTextContent(requested),
      );
      await act(async () => finishMutation());
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('Save rejected'),
      );
      expect(screen.getByTestId('dates')).toHaveTextContent(original);
      expect(screen.getByTestId('dependencies')).toHaveTextContent(
        sourceName === 'task' ? 'dependency-1' : '',
      );
      expect(operations).toEqual([
        sourceName === 'task' ? 'updateTask' : 'updateProject',
      ]);
      expect(aggregateRefresh).not.toHaveBeenCalled();
    });

    it.each([false, true])(
      'renders real chip cache updates and gesture rollback (rejected: %s)',
      async (rejected) => {
        await mount();
        rejectMutation = rejected;
        const chip = screen.getByTestId('timeline-task-chip-task-1');
        expect(chip).toHaveStyle({ gridColumn: '1 / span 7' });
        const track = chip.closest('[role="gridcell"]')!;
        jest.spyOn(track, 'getBoundingClientRect').mockReturnValue({
          width: screen.getAllByRole('columnheader').length * 112,
        } as DOMRect);
        fireEvent.mouseDown(
          screen.getByRole('button', {
            name:
              sourceName === 'task'
                ? 'Resize task start date'
                : 'Resize record start date',
          }),
          { clientX: 0 },
        );
        fireEvent.mouseMove(window, { clientX: 224 });
        fireEvent.mouseUp(window, { clientX: 224 });
        const operation =
          sourceName === 'task' ? 'updateTask' : 'updateProject';
        await waitFor(() => expect(operations).toEqual([operation]));
        expect(mutationInput).toEqual({
          [startName]: requested,
          [endName]: '2026-09-25',
        });
        await act(async () => finishMutation());
        await waitFor(() =>
          expect(chip).toHaveStyle({
            gridColumn: rejected ? '1 / span 7' : '4 / span 4',
          }),
        );
        if (rejected)
          expect(screen.getByRole('alert')).toHaveTextContent('Save rejected');
        else expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(operations).toEqual([operation]);
      },
    );
  },
);
