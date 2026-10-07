import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordCatalogCard } from '@/object-record/record-index/components/RecordCatalogCard';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { useMigrateCatalogViewFields } from '@/object-record/record-index/hooks/useMigrateCatalogViewFields';
import { extractImageUrlFromText } from '@/object-record/utils/extractImageUrlFromText';
import { getRecordFieldTextValue } from '@/object-record/utils/getRecordFieldTextValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewType } from '@/views/types/ViewType';

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

    if (typeof record.primaryLinkUrl === 'string') {
      return record.primaryLinkUrl;
    }

    if (typeof record.url === 'string') {
      return record.url;
    }

    if (typeof record.markdown === 'string') {
      return extractImageUrlFromText(record.markdown);
    }

    if (typeof record.blocknote === 'string') {
      return extractImageUrlFromText(record.blocknote);
    }
  }

  return undefined;
};

export const RecordIndexCatalogContainer = () => {
  const {
    objectNameSingular,
    objectMetadataItem,
    labelIdentifierFieldMetadataItem,
  } = useRecordIndexContextOrThrow();

  const { currentView } = useGetCurrentViewOnly();
  const isCompact = currentView?.isCompact ?? false;

  useMigrateCatalogViewFields({
    currentView,
    availableFieldMetadataIds: objectMetadataItem.fields.map(
      (fieldMetadataItem) => fieldMetadataItem.id,
    ),
  });

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const { records, loading, hasNextPage, fetchMoreRecords } =
    useRecordIndexTableQuery(objectNameSingular);

  const cardFields = useMemo(() => {
    const viewFields = [...(currentView?.viewFields ?? [])]
      .sort(
        (firstViewField, secondViewField) =>
          firstViewField.position - secondViewField.position ||
          firstViewField.fieldMetadataId.localeCompare(
            secondViewField.fieldMetadataId,
          ),
      )
      .filter((viewField) => viewField.isVisible);

    return viewFields
      .map((viewField) =>
        objectMetadataItem.fields.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === viewField.fieldMetadataId,
        ),
      )
      .filter(isDefined)
      .filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.id !== labelIdentifierFieldMetadataItem?.id,
      );
  }, [currentView, objectMetadataItem, labelIdentifierFieldMetadataItem]);

  const automaticSubtitleField = cardFields[0];
  const automaticDetailField = cardFields[1];
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

    const fieldMetadataItem = objectMetadataItem.fields.find(
      (field) => field.id === fieldMetadataId,
    );

    if (!isDefined(fieldMetadataItem)) {
      return undefined;
    }

    const viewField = currentView?.viewFields.find(
      (field) => field.fieldMetadataId === fieldMetadataId,
    );

    return viewField?.isVisible === false ? undefined : fieldMetadataItem;
  };

  const subtitleField =
    getVisibleCatalogRoleField(catalogRoleFieldMetadataIds?.subtitle) ??
    automaticSubtitleField;
  const detailField =
    getVisibleCatalogRoleField(catalogRoleFieldMetadataIds?.detail) ??
    automaticDetailField;
  const imageField = getVisibleCatalogRoleField(
    catalogRoleFieldMetadataIds?.image,
  );

  const cards = records.map((record) => ({
    id: record.id,
    title: isDefined(labelIdentifierFieldMetadataItem)
      ? (getRecordFieldTextValue(
          record[labelIdentifierFieldMetadataItem.name],
        ) ?? '')
      : '',
    subtitle: isDefined(subtitleField)
      ? getRecordFieldTextValue(record[subtitleField.name])
      : undefined,
    detail: isDefined(detailField)
      ? getRecordFieldTextValue(record[detailField.name])
      : undefined,
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

  if (!loading && cards.length === 0) {
    return <StyledEmpty>{t`No hay registros para mostrar`}</StyledEmpty>;
  }

  return (
    <StyledScroll>
      <StyledGrid>
        {cards.map((card) => (
          <RecordCatalogCard
            key={card.id}
            detail={card.detail}
            imageSrc={card.imageSrc}
            isCompact={isCompact}
            onClick={() => openRecordFromIndexView({ recordId: card.id })}
            subtitle={card.subtitle}
            title={card.title}
          />
        ))}
      </StyledGrid>
      {hasNextPage && (
        <StyledMoreButton type="button" onClick={() => fetchMoreRecords()}>
          {t`Ver más`}
        </StyledMoreButton>
      )}
    </StyledScroll>
  );
};
