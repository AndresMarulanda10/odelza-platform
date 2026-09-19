import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type PersonalFinanceConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('PersonalFinanceConfiguration')
export class PersonalFinanceConfigurationDTO
  implements PersonalFinanceConfiguration
{
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.PERSONAL_FINANCE])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.PERSONAL_FINANCE;
}
