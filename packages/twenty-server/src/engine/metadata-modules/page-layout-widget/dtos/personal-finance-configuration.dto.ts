import { Field, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  type SerializedRelation,
  type PersonalFinanceConfiguration,
  type PersonalFinanceSourceMapping,
} from 'twenty-shared/types';
import { CurrencyCode } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('PersonalFinanceSourceMapping')
export class PersonalFinanceSourceMappingDTO implements PersonalFinanceSourceMapping {
  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  incomeFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  expenseFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  budgetFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  assetFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  liabilityFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  dateFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryFieldMetadataId?: SerializedRelation | null;
}

@ObjectType('PersonalFinanceConfiguration')
export class PersonalFinanceConfigurationDTO implements PersonalFinanceConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.PERSONAL_FINANCE])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.PERSONAL_FINANCE;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(CurrencyCode)
  baseCurrencyCode?: CurrencyCode | null;

  @Field(() => PersonalFinanceSourceMappingDTO, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => PersonalFinanceSourceMappingDTO)
  source?: PersonalFinanceSourceMappingDTO | null;
}
