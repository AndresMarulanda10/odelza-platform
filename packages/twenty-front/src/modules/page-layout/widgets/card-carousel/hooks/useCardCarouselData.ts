import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { CARD_CAROUSEL_DEFAULT_ITEM_COUNT } from '@/page-layout/utils/createDefaultCardCarouselWidget';
import { extractImageUrlFromText } from '@/object-record/utils/extractImageUrlFromText';
import { type WidgetDataState } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type CardCarouselWidgetItem = {
  id: string;
  imageSrc?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  price?: string;
};

export type CardCarouselWidgetData = {
  status: WidgetDataState;
  items: CardCarouselWidgetItem[];
  hasConfigurationGap: boolean;
};

// Los nombres de los campos salen de la configuración del widget; el respaldo
// existe para que un widget recién creado muestre algo sin configurar nada.
const getConfiguredFieldName = ({
  fields,
  configuredFieldMetadataId,
  fallbackNames,
}: {
  fields: Array<{ id: string; name: string }>;
  configuredFieldMetadataId?: string | null;
  fallbackNames: string[];
}): string | undefined => {
  if (isDefined(configuredFieldMetadataId)) {
    const configuredField = fields.find(
      (field) => field.id === configuredFieldMetadataId,
    );

    if (isDefined(configuredField)) {
      return configuredField.name;
    }
  }

  return fields.find((field) => fallbackNames.includes(field.name))?.name;
};

const readTextValue = (value: unknown): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value.trim() === '' ? undefined : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object' && 'name' in value) {
    return readTextValue((value as { name: unknown }).name);
  }

  if (typeof value === 'object' && 'primaryLinkLabel' in value) {
    return readTextValue((value as { primaryLinkLabel: unknown }).primaryLinkLabel);
  }

  return undefined;
};

const readImageUrlValue = (value: unknown): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value.trim() === '' ? undefined : value;
  }

  if (typeof value !== 'object') {
    return undefined;
  }

  if ('primaryLinkUrl' in value) {
    const url = (value as { primaryLinkUrl?: string | null }).primaryLinkUrl;

    return isDefined(url) && url !== '' ? url : undefined;
  }

  // En un campo de texto enriquecido la imagen vive dentro del cuerpo.
  const richTextValue = value as { markdown?: unknown; blocknote?: unknown };

  if (typeof richTextValue.markdown === 'string') {
    return extractImageUrlFromText(richTextValue.markdown);
  }

  if (typeof richTextValue.blocknote === 'string') {
    return extractImageUrlFromText(richTextValue.blocknote);
  }

  return undefined;
};

const formatPriceValue = ({
  value,
  type,
  currencyCode,
}: {
  value: unknown;
  type?: string;
  currencyCode?: string | null;
}): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (type === 'CURRENCY' && typeof value === 'object') {
    const amountMicros = (value as { amountMicros?: number | null }).amountMicros;
    const code = (value as { currencyCode?: string | null }).currencyCode;

    if (!isDefined(amountMicros)) {
      return undefined;
    }

    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: code ?? currencyCode ?? 'USD',
        maximumFractionDigits: 2,
      }).format(amountMicros / 1_000_000);
    } catch {
      return String(amountMicros / 1_000_000);
    }
  }

  if (typeof value === 'number') {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(value);
  }

  return readTextValue(value);
};

export const useCardCarouselData = ({
  widget,
  objectMetadataItem,
}: {
  widget: PageLayoutWidget;
  objectMetadataItem: EnrichedObjectMetadataItem;
}): CardCarouselWidgetData => {
  const configuration =
    widget.configuration?.__typename === 'CardCarouselConfiguration'
      ? widget.configuration
      : null;

  const fields = objectMetadataItem?.fields ?? [];
  const fieldMapping = configuration?.fieldMapping ?? null;

  const imageFieldName = getConfiguredFieldName({
    fields,
    configuredFieldMetadataId: fieldMapping?.imageFieldMetadataId,
    fallbackNames: ['image', 'avatar', 'photo', 'picture'],
  });
  const titleFieldName = getConfiguredFieldName({
    fields,
    configuredFieldMetadataId: fieldMapping?.titleFieldMetadataId,
    fallbackNames: ['name', 'title', 'label'],
  });
  const subtitleFieldName = getConfiguredFieldName({
    fields,
    configuredFieldMetadataId: fieldMapping?.subtitleFieldMetadataId,
    fallbackNames: ['description', 'category', 'jobTitle'],
  });
  const priceFieldName = getConfiguredFieldName({
    fields,
    configuredFieldMetadataId: fieldMapping?.priceFieldMetadataId,
    fallbackNames: ['amount', 'price', 'value'],
  });

  const itemCount = configuration?.itemCount ?? CARD_CAROUSEL_DEFAULT_ITEM_COUNT;

  const recordGqlFields = Object.fromEntries(
    [imageFieldName, titleFieldName, subtitleFieldName, priceFieldName]
      .filter(isDefined)
      .map((fieldName) => [fieldName, true]),
  ) as Record<string, true>;

  const priceFieldMetadata = fields.find(
    (field) => field.name === priceFieldName,
  );

  const { records, loading, error } = useFindManyRecords<ObjectRecord>({
    objectNameSingular: objectMetadataItem.nameSingular,
    limit: itemCount,
    // Lo mas reciente primero: es lo que se espera de un carrusel de novedades.
    orderBy: [{ createdAt: 'DescNullsLast' }],
    skip: Object.keys(recordGqlFields).length === 0,
    recordGqlFields,
  });

  const items: CardCarouselWidgetItem[] = records.map((record) => ({
    id: record.id,
    imageSrc: imageFieldName
      ? readImageUrlValue(record[imageFieldName])
      : undefined,
    title: (titleFieldName ? readTextValue(record[titleFieldName]) : undefined) ?? '—',
    subtitle: subtitleFieldName
      ? readTextValue(record[subtitleFieldName])
      : undefined,
    price: priceFieldName
      ? formatPriceValue({
          value: record[priceFieldName],
          type: priceFieldMetadata?.type,
        })
      : undefined,
  }));

  if (isDefined(error)) {
    return { status: 'error', items: [], hasConfigurationGap: false };
  }

  if (loading) {
    return { status: 'loading', items: [], hasConfigurationGap: false };
  }

  return {
    status: items.length === 0 ? 'empty' : 'ready',
    items,
    hasConfigurationGap: !isDefined(titleFieldName),
  };
};
