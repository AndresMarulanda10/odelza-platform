import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsUUID, Matches } from 'class-validator';
import { type ViewTimelineConfiguration } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class ViewTimelineConfigurationInput implements ViewTimelineConfiguration {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  startDateFieldMetadataUniversalIdentifier?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  endDateFieldMetadataUniversalIdentifier?: string | null;

  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  @Field(() => String, { nullable: true })
  barColor?: string | null;
}
