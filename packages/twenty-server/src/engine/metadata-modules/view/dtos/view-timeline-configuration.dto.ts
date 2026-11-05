import { Field, ObjectType } from '@nestjs/graphql';
import { type ViewTimelineConfiguration } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ViewTimelineConfiguration')
export class ViewTimelineConfigurationDTO implements ViewTimelineConfiguration {
  @Field(() => UUIDScalarType, { nullable: true })
  startDateFieldMetadataUniversalIdentifier?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  endDateFieldMetadataUniversalIdentifier?: string | null;

  @Field(() => String, { nullable: true })
  barColor?: string | null;
}
