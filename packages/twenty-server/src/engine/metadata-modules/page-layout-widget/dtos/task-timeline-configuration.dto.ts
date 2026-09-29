import { Field, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';

import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import {
  type SerializedRelation,
  type TaskTimelineConfiguration,
  type TaskTimelineFieldMapping,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('TaskTimelineFieldMapping')
export class TaskTimelineFieldMappingDTO implements TaskTimelineFieldMapping {
  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  titleFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  startDateFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  dueDateFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  progressFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  statusFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  milestoneFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  dependencyFieldMetadataId?: SerializedRelation | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  dependencyTypeFieldMetadataId?: SerializedRelation | null;
}

@ObjectType('TaskTimelineConfiguration')
export class TaskTimelineConfigurationDTO implements TaskTimelineConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.TASK_TIMELINE])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.TASK_TIMELINE;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  barColor?: string | null;

  @Field(() => TaskTimelineFieldMappingDTO, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaskTimelineFieldMappingDTO)
  fieldMapping?: TaskTimelineFieldMappingDTO | null;
}
