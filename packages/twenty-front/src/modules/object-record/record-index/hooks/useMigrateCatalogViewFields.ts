import { atom, useStore } from 'jotai';
import { useEffect, useState } from 'react';

import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { type View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { buildCatalogViewFieldMigrationPlan } from '@/object-record/record-index/utils/buildCatalogViewFieldMigrationPlan';

const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;

const inFlightMigrationKeys = new Set<string>();

export const useMigrateCatalogViewFields = ({
  availableFieldMetadataIds,
  currentView,
}: {
  availableFieldMetadataIds: string[];
  currentView: View | undefined;
}) => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { performViewFieldAPICreate } = usePerformViewFieldAPIPersist();
  const store = useStore();
  const [migrationState] = useState(() =>
    atom({
      completedKeys: new Set<string>(),
      retryAttempts: new Map<string, number>(),
      retryTimeouts: new Map<string, ReturnType<typeof setTimeout>>(),
      isMounted: false,
    }),
  );
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    store.set(migrationState, (state) => ({ ...state, isMounted: true }));

    return () => {
      store.get(migrationState).retryTimeouts.forEach(clearTimeout);
      store.set(migrationState, (state) => ({
        ...state,
        isMounted: false,
        retryTimeouts: new Map(),
      }));
    };
  }, [migrationState, store]);

  useEffect(() => {
    if (
      !currentView ||
      currentView.type !== ViewType.CATALOG ||
      !canPersistChanges
    ) {
      return;
    }

    const roleFieldMappings: {
      property:
        | 'catalogImageFieldMetadataId'
        | 'catalogSubtitleFieldMetadataId'
        | 'catalogDetailFieldMetadataId';
      fieldMetadataId: string | null | undefined;
    }[] = [
      {
        property: 'catalogImageFieldMetadataId',
        fieldMetadataId: currentView.catalogImageFieldMetadataId,
      },
      {
        property: 'catalogSubtitleFieldMetadataId',
        fieldMetadataId: currentView.catalogSubtitleFieldMetadataId,
      },
      {
        property: 'catalogDetailFieldMetadataId',
        fieldMetadataId: currentView.catalogDetailFieldMetadataId,
      },
    ] as const;
    const activeRoleFieldMappings = roleFieldMappings.flatMap(
      ({ property, fieldMetadataId }) =>
        typeof fieldMetadataId === 'string' &&
        availableFieldMetadataIds.includes(fieldMetadataId)
          ? [{ property, fieldMetadataId }]
          : [],
    );

    if (activeRoleFieldMappings.length === 0) {
      return;
    }

    const migrationKey = [
      currentView.id,
      ...activeRoleFieldMappings.map(
        ({ property, fieldMetadataId }) => `${property}:${fieldMetadataId}`,
      ),
    ].join('|');

    if (
      store.get(migrationState).completedKeys.has(migrationKey) ||
      inFlightMigrationKeys.has(migrationKey) ||
      store.get(migrationState).retryTimeouts.has(migrationKey)
    ) {
      return;
    }

    const plan = buildCatalogViewFieldMigrationPlan({
      availableFieldMetadataIds,
      legacyRoleFieldMetadataIds: activeRoleFieldMappings.map(
        ({ fieldMetadataId }) => fieldMetadataId,
      ),
      viewFields: currentView.viewFields,
    });

    if (plan.viewFieldsToCreate.length === 0) {
      return;
    }

    inFlightMigrationKeys.add(migrationKey);

    const scheduleRetry = () => {
      const state = store.get(migrationState);
      if (!state.isMounted || state.retryTimeouts.has(migrationKey)) {
        return;
      }

      const retryAttempt = (state.retryAttempts.get(migrationKey) ?? 0) + 1;
      const retryDelay = Math.min(
        INITIAL_RETRY_DELAY_MS * 2 ** (retryAttempt - 1),
        MAX_RETRY_DELAY_MS,
      );
      const timeout = setTimeout(() => {
        store.set(migrationState, (previousState) => {
          const retryTimeouts = new Map(previousState.retryTimeouts);
          retryTimeouts.delete(migrationKey);
          return { ...previousState, retryTimeouts };
        });

        if (store.get(migrationState).isMounted) {
          setRetryTrigger((previousRetryTrigger) => previousRetryTrigger + 1);
        }
      }, retryDelay);

      store.set(migrationState, (previousState) => ({
        ...previousState,
        retryAttempts: new Map(previousState.retryAttempts).set(
          migrationKey,
          retryAttempt,
        ),
        retryTimeouts: new Map(previousState.retryTimeouts).set(
          migrationKey,
          timeout,
        ),
      }));
    };

    const runMigration = async () => {
      try {
        const createResult = await performViewFieldAPICreate({
          inputs: plan.viewFieldsToCreate.map((viewField) => ({
            id: viewField.id,
            fieldMetadataId: viewField.fieldMetadataId,
            position: viewField.position,
            isVisible: viewField.isVisible,
            size: viewField.size,
            aggregateOperation: viewField.aggregateOperation,
            viewId: currentView.id,
          })),
        });

        if (createResult.status === 'successful') {
          if (store.get(migrationState).isMounted) {
            store.set(migrationState, (state) => {
              const retryAttempts = new Map(state.retryAttempts);
              retryAttempts.delete(migrationKey);
              return {
                ...state,
                completedKeys: new Set(state.completedKeys).add(migrationKey),
                retryAttempts,
              };
            });
          }
          return;
        }

        scheduleRetry();
      } catch {
        scheduleRetry();
      } finally {
        inFlightMigrationKeys.delete(migrationKey);
      }
    };

    void runMigration();
  }, [
    availableFieldMetadataIds,
    canPersistChanges,
    currentView,
    performViewFieldAPICreate,
    retryTrigger,
    migrationState,
    store,
  ]);
};
