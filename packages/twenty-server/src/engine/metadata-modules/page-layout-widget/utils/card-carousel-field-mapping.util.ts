export const CARD_CAROUSEL_FIELD_MAPPINGS = [
  ['imageFieldMetadataId', 'imageFieldMetadataUniversalIdentifier'],
  ['titleFieldMetadataId', 'titleFieldMetadataUniversalIdentifier'],
  ['subtitleFieldMetadataId', 'subtitleFieldMetadataUniversalIdentifier'],
  ['priceFieldMetadataId', 'priceFieldMetadataUniversalIdentifier'],
] as const;

export type CardCarouselFieldMappingUniversal = {
  [P in (typeof CARD_CAROUSEL_FIELD_MAPPINGS)[number][1]]?: string | null;
};
