import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { atom, useAtomValue, useStore } from 'jotai';
import { useEffect, useMemo } from 'react';
import { Loader } from 'twenty-ui/feedback';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordCatalogCard } from '@/object-record/record-index/components/RecordCatalogCard';
import { RecordCatalogField } from '@/object-record/record-index/components/RecordCatalogField';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { useMigrateCatalogViewFields } from '@/object-record/record-index/hooks/useMigrateCatalogViewFields';
import { extractImageUrlFromText } from '@/object-record/utils/extractImageUrlFromText';
import { getRecordFieldTextValue } from '@/object-record/utils/getRecordFieldTextValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewType } from '@/views/types/ViewType';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledScroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  height: 100%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
`;

const StyledMoreButton = styled.button`
  align-self: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
`;

const StyledEmpty = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  height: 100%;
  justify-content: center;
`;

const readImageSrc = (value: unknown): string | undefined => {
  if (!isDefined(value)) {
    return undefined;
  }

  if (typeof value === 'string') {
    return extractImageUrlFromText(value);
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const src = readImageSrc(entry);

      if (isDefined(src)) {
        return src;
      }
    }

    return undefined;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    // Native FILES metadata can identify an image without a URL extension.
    if (record.fileCategory === 'IMAGE' && typeof record.url === 'string') {
      const url = record.url.trim();
      try {
        if (['http:', 'https:'].includes(new URL(url).protocol)) {
          return url;
        }
      } catch {
        // Invalid attachment URLs must not prevent later candidates.
      }
    }

    for (const candidate of [
      record.primaryLinkUrl,
      record.url,
      record.markdown,
      record.blocknote,
    ]) {
      const src =
        typeof candidate === 'string'
          ? extractImageUrlFromText(candidate)
          : undefined;
      if (isDefined(src)) {
        return src;
      }
    }
  }

  return undefined;
};

export const RecordIndexCatalogContainer = () => {
  const {
    objectNameSingular,
    objectMetadataItem,
    labelIdentifierFieldMetadataItem,
    fieldDefinitionByFieldMetadataItemId,
    recordIndexId,
  } = useRecordIndexContextOrThrow();

  const { currentView } = useGetCurrentViewOnly();
  const isCompact = currentView?.isCompact ?? false;
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
    recordIndexId,
  );
  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
    recordIndexId,
  );
  const { canPersistChanges } = useCanPersistViewChanges();

  useMigrateCatalogViewFields({
    currentView,
    availableFieldMetadataIds: objectMetadataItem.fields.map(
      (fieldMetadataItem) => fieldMetadataItem.id,
    ),
  });

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const {
    records,
    loading,
    hasNextPage,
    fetchMoreRecords,
    error,
    refetch,
    queryIdentifier,
  } = useRecordIndexTableQuery(objectNameSingular);

  const isFetchingMoreRecords = useAtomFamilyStateValue(
    isFetchingMoreRecordsFamilyState,
    queryIdentifier,
  );
  const store = useStore();
  const requestState = useMemo(
    () => atom({ queryIdentifier, pending: false, failed: false }),
    [queryIdentifier],
  );
  const currentRequest = useAtomValue(requestState);

  useEffect(() => {
    return () => {
      // Invalidate the request identity on query changes and unmount.
      store.set(requestState, (state) => ({ ...state, pending: false }));
    };
  }, [requestState, store]);
  const isBusy =
    loading || isFetchingMoreRecords || currentRequest?.pending === true;

  const handleRequest = async (retryQuery: boolean) => {
    if (isBusy || store.get(requestState).pending) {
      return;
    }
    const request = { queryIdentifier, pending: true, failed: false };
    store.set(requestState, request);
    try {
      const result = await (retryQuery ? refetch() : fetchMoreRecords());
      if (store.get(requestState) === request) {
        store.set(requestState, {
          queryIdentifier,
          pending: false,
          failed: isDefined(result?.error),
        });
      }
    } catch {
      if (store.get(requestState) === request) {
        store.set(requestState, {
          queryIdentifier,
          pending: false,
          failed: true,
        });
      }
    }
  };

  const cardFields = useMemo(() => {
    const selectedFields = visibleRecordFields
      .map((recordField) =>
        objectMetadataItem.fields.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === recordField.fieldMetadataItemId,
        ),
      )
      .filter(isDefined)
      .filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.id !== labelIdentifierFieldMetadataItem?.id,
      );

    // A read-only, unmigrated legacy view has no Fields selection yet.
    // Any existing local or persisted row (including hidden rows) ends this fallback.
    if (
      !canPersistChanges &&
      currentView?.type === ViewType.CATALOG &&
      currentView.viewFields.length === 0 &&
      currentRecordFields.length === 0
    ) {
      const legacyIds = new Set([
        currentView.catalogImageFieldMetadataId,
        currentView.catalogSubtitleFieldMetadataId,
        currentView.catalogDetailFieldMetadataId,
      ]);
      return objectMetadataItem.readableFields.filter(
        (field) =>
          legacyIds.has(field.id) &&
          field.id !== labelIdentifierFieldMetadataItem?.id &&
          isActiveFieldMetadataItem({
            objectNameSingular,
            fieldMetadata: field,
          }),
      );
    }
    return selectedFields;
  }, [
    visibleRecordFields,
    objectMetadataItem,
    labelIdentifierFieldMetadataItem,
    canPersistChanges,
    currentView,
    currentRecordFields,
    objectNameSingular,
  ]);

  const catalogRoleFieldMetadataIds =
    currentView?.type === ViewType.CATALOG
      ? {
          image: currentView.catalogImageFieldMetadataId,
          subtitle: currentView.catalogSubtitleFieldMetadataId,
          detail: currentView.catalogDetailFieldMetadataId,
        }
      : undefined;

  const getVisibleCatalogRoleField = (fieldMetadataId?: string | null) => {
    if (!isDefined(fieldMetadataId)) {
      return undefined;
    }

    const fieldMetadataItem = cardFields.find(
      (field) => field.id === fieldMetadataId,
    );

    if (!isDefined(fieldMetadataItem)) {
      return undefined;
    }

    return fieldMetadataItem;
  };
  const imageField = getVisibleCatalogRoleField(
    catalogRoleFieldMetadataIds?.image,
  );

  const cards = records.map((record) => ({
    id: record.id,
    title:
      isDefined(labelIdentifierFieldMetadataItem) &&
      objectMetadataItem.readableFields.some(
        (field) => field.id === labelIdentifierFieldMetadataItem.id,
      )
        ? (getRecordFieldTextValue(
            record[labelIdentifierFieldMetadataItem.name],
          ) ?? '')
        : '',
    imageSrc:
      (isDefined(imageField)
        ? readImageSrc(record[imageField.name])
        : undefined) ??
      cardFields
        .map((fieldMetadataItem) =>
          readImageSrc(record[fieldMetadataItem.name]),
        )
        .find(isDefined),
  }));

  const hasError = isDefined(error) || currentRequest?.failed === true;

  if (isBusy && cards.length === 0) {
    return (
      <StyledEmpty role="status" aria-label={t`Loading`}>
        <Loader />
      </StyledEmpty>
    );
  }

  if (!hasError && cards.length === 0) {
    return <StyledEmpty>{t`No records to display`}</StyledEmpty>;
  }

  return (
    <StyledScroll>
      <StyledGrid>
        {cards.map((card) => (
          <RecordCatalogCard
            key={card.id}
            imageSrc={card.imageSrc}
            isCompact={isCompact}
            onClick={() => openRecordFromIndexView({ recordId: card.id })}
            fields={cardFields.map((field) => {
              const fieldDefinition =
                fieldDefinitionByFieldMetadataItemId[field.id];
              return isDefined(fieldDefinition) ? (
                <RecordCatalogField
                  key={field.id}
                  recordId={card.id}
                  recordIndexId={recordIndexId}
                  fieldDefinition={fieldDefinition}
                  fieldMetadataItem={field}
                />
              ) : null;
            })}
            title={card.title}
          />
        ))}
      </StyledGrid>
      {hasError && <div role="alert">{t`Unable to load records`}</div>}
      {(hasError || hasNextPage) && (
        <StyledMoreButton
          type="button"
          disabled={isBusy}
          onClick={() =>
            void handleRequest(isDefined(error) || cards.length === 0)
          }
        >
          {isBusy ? t`Loading` : hasError ? t`Retry` : t`Load more`}
        </StyledMoreButton>
      )}
    </StyledScroll>
  );
};
