import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  type CardCarouselConfiguration,
  type CardCarouselFieldMapping,
  type CardCarouselHoverEffect,
  type CardCarouselImageAspect,
  type CardCarouselLayout,
  type CardCarouselRadius,
  type CardCarouselSize,
  type CardCarouselTextAlign,
  type SerializedRelation,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

export const CARD_CAROUSEL_LAYOUTS: CardCarouselLayout[] = [
  'imageTop',
  'imageCenter',
  'imageOverlay',
  'textOnly',
];

export const CARD_CAROUSEL_IMAGE_ASPECTS: CardCarouselImageAspect[] = [
  'square',
  'portrait',
  'wide',
  'circle',
];

export const CARD_CAROUSEL_RADII: CardCarouselRadius[] = [
  'square',
  'soft',
  'rounded',
  'pill',
];

export const CARD_CAROUSEL_SIZES: CardCarouselSize[] = ['sm', 'md', 'lg'];

export const CARD_CAROUSEL_TEXT_ALIGNMENTS: CardCarouselTextAlign[] = [
  'left',
  'center',
  'right',
];

export const CARD_CAROUSEL_HOVER_EFFECTS: CardCarouselHoverEffect[] = [
  'lift',
  'scale',
  'glow',
  'none',
];

export const CARD_CAROUSEL_ITEM_COUNT_MIN = 1;
export const CARD_CAROUSEL_ITEM_COUNT_MAX = 50;

@ObjectType('CardCarouselFieldMapping')
export class CardCarouselFieldMappingDTO implements CardCarouselFieldMapping {
  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  imageFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  titleFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  subtitleFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  priceFieldMetadataId?: SerializedRelation | null;
}

@ObjectType('CardCarouselConfiguration')
export class CardCarouselConfigurationDTO implements CardCarouselConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.CARD_CAROUSEL])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.CARD_CAROUSEL;

  @Field(() => CardCarouselFieldMappingDTO, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardCarouselFieldMappingDTO)
  fieldMapping?: CardCarouselFieldMappingDTO | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(CARD_CAROUSEL_LAYOUTS)
  cardLayout?: CardCarouselLayout | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(CARD_CAROUSEL_IMAGE_ASPECTS)
  imageAspect?: CardCarouselImageAspect | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(CARD_CAROUSEL_RADII)
  cardRadius?: CardCarouselRadius | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(CARD_CAROUSEL_SIZES)
  cardSize?: CardCarouselSize | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(CARD_CAROUSEL_TEXT_ALIGNMENTS)
  textAlign?: CardCarouselTextAlign | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(CARD_CAROUSEL_HOVER_EFFECTS)
  hoverEffect?: CardCarouselHoverEffect | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(CARD_CAROUSEL_ITEM_COUNT_MIN)
  @Max(CARD_CAROUSEL_ITEM_COUNT_MAX)
  itemCount?: number | null;
}
