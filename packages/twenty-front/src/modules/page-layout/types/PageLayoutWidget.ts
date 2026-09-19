import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type Nullable } from 'twenty-shared/types';
import {
  type FieldsConfiguration,
  type PageLayoutWidget as PageLayoutWidgetGenerated,
  type TaskTimelineConfiguration,
  type WidgetConfiguration,
} from '~/generated-metadata/graphql';

export type PageLayoutWidget = Omit<
  PageLayoutWidgetGenerated,
  'objectMetadataId' | 'configuration'
> & {
  objectMetadataId?: Nullable<string>;
  configuration:
    | WidgetConfiguration
    | TaskTimelineConfiguration
    | FieldsConfiguration
    | FieldConfiguration;
  conditionalAvailabilityExpression?: Nullable<string>;
};
