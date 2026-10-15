import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { atom, useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

type AttentionPage = {
  identity: string;
  records: ObjectRecord[];
  totalCount: number | null;
  hasNextPage: boolean;
  loading: boolean;
  error: boolean;
};

const initialPage = (identity: string): AttentionPage => ({
  identity,
  records: [],
  totalCount: null,
  hasNextPage: false,
  loading: true,
  error: false,
});

// The native query owns filters, member timezone, ordering, permissions and cursors.
// Local state only controls presentation, deduplication and async result ownership.
export const useOverdueAttentionRecords = (
  assigneeFields?: RecordGqlOperationGqlRecordFields,
) => {
  const { objectMetadataItem, objectNameSingular, recordIndexId } =
    useRecordIndexContextOrThrow();
  const params = useFindManyRecordIndexTableParams(
    objectNameSingular,
    recordIndexId,
  );
  const relevantFields: RecordGqlOperationGqlRecordFields =
    useRelevantRecordsGqlFields({ objectMetadataItem });
  const recordGqlFields: RecordGqlOperationGqlRecordFields = {
    id: true,
    title: relevantFields.title ?? true,
    dueAt: relevantFields.dueAt ?? true,
    status: relevantFields.status ?? true,
    ...(assigneeFields ? { assignee: assigneeFields } : {}),
  };
  const nativeQuery = useLazyFindManyRecords({
    ...params,
    limit: 5,
    recordGqlFields,
    fetchPolicy: 'network-only',
  });
  const identity = JSON.stringify([
    recordIndexId,
    nativeQuery.queryIdentifier,
    recordGqlFields,
  ]);
  const store = useStore();
  const [requestState] = useState(() =>
    atom<{
      query: typeof nativeQuery;
      identity: string;
      request: object | null;
    }>({ query: nativeQuery, identity, request: null }),
  );
  // Keep the latest native callbacks without restarting an unchanged query.
  store.set(requestState, (state) => ({
    ...state,
    query: nativeQuery,
    identity,
  }));
  const [page, setPage] = useState(() => initialPage(identity));
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const request = {};
    store.set(requestState, (state) => ({ ...state, request }));
    setPage(initialPage(identity));
    void store
      .get(requestState)
      .query.findManyRecordsLazy()
      .then(
        (result) => {
          if (!active || store.get(requestState).identity !== identity) return;
          const failed = !!result.error || !result.data;
          setPage({
            identity,
            records: failed ? [] : (result.records ?? []),
            totalCount: failed ? null : result.totalCount,
            hasNextPage: !failed && result.hasNextPage,
            loading: false,
            error: failed,
          });
        },
        () => {
          if (active && store.get(requestState).identity === identity) {
            setPage({ ...initialPage(identity), loading: false, error: true });
          }
        },
      )
      .finally(() => {
        if (store.get(requestState).request === request) {
          store.set(requestState, (state) => ({ ...state, request: null }));
        }
      });
    return () => {
      active = false;
      if (store.get(requestState).request === request) {
        store.set(requestState, (state) => ({ ...state, request: null }));
      }
    };
  }, [identity, retry, requestState, store]);

  const currentPage = page.identity === identity ? page : initialPage(identity);
  const loadMore = async () => {
    if (store.get(requestState).request || !currentPage.hasNextPage) return;
    const request = {};
    store.set(requestState, (state) => ({ ...state, request }));
    setPage((previous) => ({ ...previous, loading: true, error: false }));
    try {
      const result = await store
        .get(requestState)
        .query.fetchMoreRecordsLazy(25);
      if (
        store.get(requestState).identity !== identity ||
        store.get(requestState).request !== request
      )
        return;
      if (
        !result ||
        ('error' in result && result.error) ||
        !('records' in result)
      )
        throw new Error('Page unavailable');
      setPage((previous) => ({
        ...previous,
        records: [
          ...new Map(
            [...previous.records, ...result.records].map((record) => [
              record.id,
              record,
            ]),
          ).values(),
        ],
        totalCount: result.totalCount ?? previous.totalCount,
        hasNextPage: result.data?.pageInfo.hasNextPage ?? false,
        loading: false,
        error: false,
      }));
    } catch {
      if (
        store.get(requestState).identity === identity &&
        store.get(requestState).request === request
      ) {
        setPage((previous) => ({ ...previous, loading: false, error: true }));
      }
    } finally {
      if (store.get(requestState).request === request) {
        store.set(requestState, (state) => ({ ...state, request: null }));
      }
    }
  };

  return {
    ...currentPage,
    loadMore,
    retry: () => setRetry((value) => value + 1),
  };
};
