import { useEffect, useRef, useState } from 'react';

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
  const completedMigrationKeys = useRef(new Set<string>());
  const retryAttemptsByKey = useRef(new Map<string, number>());
  const retryTimeoutsByKey = useRef(
    new Map<string, ReturnType<typeof setTimeout>>(),
  );
  const isMounted = useRef(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      retryTimeoutsByKey.current.forEach(clearTimeout);
      retryTimeoutsByKey.current.clear();
    };
  }, []);

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
      completedMigrationKeys.current.has(migrationKey) ||
      inFlightMigrationKeys.has(migrationKey) ||
      retryTimeoutsByKey.current.has(migrationKey)
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
      if (!isMounted.current || retryTimeoutsByKey.current.has(migrationKey)) {
        return;
      }

      const retryAttempt =
        (retryAttemptsByKey.current.get(migrationKey) ?? 0) + 1;
      retryAttemptsByKey.current.set(migrationKey, retryAttempt);
      const retryDelay = Math.min(
        INITIAL_RETRY_DELAY_MS * 2 ** (retryAttempt - 1),
        MAX_RETRY_DELAY_MS,
      );
      const timeout = setTimeout(() => {
        retryTimeoutsByKey.current.delete(migrationKey);

        if (isMounted.current) {
          setRetryTrigger((previousRetryTrigger) => previousRetryTrigger + 1);
        }
      }, retryDelay);

      retryTimeoutsByKey.current.set(migrationKey, timeout);
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
          completedMigrationKeys.current.add(migrationKey);
          retryAttemptsByKey.current.delete(migrationKey);
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
  ]);
};
