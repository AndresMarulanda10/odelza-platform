import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type TaskTimelineConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('TaskTimelineConfiguration')
export class TaskTimelineConfigurationDTO
  implements TaskTimelineConfiguration
{
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.TASK_TIMELINE])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.TASK_TIMELINE;
}
