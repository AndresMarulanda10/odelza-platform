import {
  type CardCarouselFieldMapping,
  type ChartFilter,
  type PersonalFinanceSourceMapping,
  type TaskTimelineFieldMapping,
  type UniversalChartFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  CARD_CAROUSEL_FIELD_MAPPINGS,
  type CardCarouselFieldMappingUniversal,
} from 'src/engine/metadata-modules/page-layout-widget/utils/card-carousel-field-mapping.util';
import {
  PERSONAL_FINANCE_SOURCE_FIELD_MAPPINGS,
  type PersonalFinanceSourceMappingUniversal,
} from 'src/engine/metadata-modules/page-layout-widget/utils/personal-finance-source-mapping.util';
import {
  TASK_TIMELINE_FIELD_MAPPINGS,
  type TaskTimelineFieldMappingUniversal,
} from 'src/engine/metadata-modules/page-layout-widget/utils/task-timeline-field-mapping.util';

type PageLayoutWidgetConfiguration = PageLayoutWidgetEntity['configuration'];

type UniversalPageLayoutWidgetConfiguration =
  NonNullable<FlatPageLayoutWidget>['universalConfiguration'];

const getFieldMetadataUniversalIdentifier = ({
  fieldMetadataId,
  fieldMetadataUniversalIdentifierById,
  shouldThrowOnMissingIdentifier,
}: {
  fieldMetadataId: string;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier: boolean;
}): string | null => {
  const universalIdentifier =
    fieldMetadataUniversalIdentifierById[fieldMetadataId];

  if (!isDefined(universalIdentifier)) {
    if (shouldThrowOnMissingIdentifier) {
      throw new FlatEntityMapsException(
        `Field metadata universal identifier not found for id: ${fieldMetadataId}`,
        FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
      );
    }

    return null;
  }

  return universalIdentifier;
};

const convertChartFilterToUniversalFilter = ({
  filter,
  fieldMetadataUniversalIdentifierById,
}: {
  filter: ChartFilter | undefined;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier: boolean;
}): UniversalChartFilter | undefined => {
  if (!isDefined(filter)) {
    return undefined;
  }

  return {
    ...filter,
    recordFilters: filter.recordFilters?.map(
      ({ fieldMetadataId, ...rest }) => ({
        ...rest,
        fieldMetadataUniversalIdentifier: getFieldMetadataUniversalIdentifier({
          fieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier: false,
        }),
      }),
    ),
  };
};

const convertPersonalFinanceSourceToUniversal = ({
  source,
  fieldMetadataUniversalIdentifierById,
  shouldThrowOnMissingIdentifier,
}: {
  source: PersonalFinanceSourceMapping | null | undefined;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier: boolean;
}): PersonalFinanceSourceMappingUniversal | null | undefined => {
  if (source === undefined || source === null) {
    return source;
  }

  return Object.fromEntries(
    PERSONAL_FINANCE_SOURCE_FIELD_MAPPINGS.flatMap(
      ([fieldMetadataKey, universalIdentifierKey]) => {
        const fieldMetadataId = source[fieldMetadataKey];

        return fieldMetadataId === undefined
          ? []
          : [
              [
                universalIdentifierKey,
                fieldMetadataId === null
                  ? null
                  : getFieldMetadataUniversalIdentifier({
                      fieldMetadataId,
                      fieldMetadataUniversalIdentifierById,
                      shouldThrowOnMissingIdentifier,
                    }),
              ],
            ];
      },
    ),
  ) as PersonalFinanceSourceMappingUniversal;
};

const convertTaskTimelineFieldMappingToUniversal = ({
  fieldMapping,
  fieldMetadataUniversalIdentifierById,
  shouldThrowOnMissingIdentifier,
}: {
  fieldMapping: TaskTimelineFieldMapping | null | undefined;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier: boolean;
}): TaskTimelineFieldMappingUniversal | null | undefined => {
  if (fieldMapping === undefined || fieldMapping === null) {
    return fieldMapping;
  }

  return Object.fromEntries(
    TASK_TIMELINE_FIELD_MAPPINGS.flatMap(
      ([fieldMetadataKey, universalIdentifierKey]) => {
        const fieldMetadataId = fieldMapping[fieldMetadataKey];

        return fieldMetadataId === undefined
          ? []
          : [
              [
                universalIdentifierKey,
                fieldMetadataId === null
                  ? null
                  : getFieldMetadataUniversalIdentifier({
                      fieldMetadataId,
                      fieldMetadataUniversalIdentifierById,
                      shouldThrowOnMissingIdentifier,
                    }),
              ],
            ];
      },
    ),
  ) as TaskTimelineFieldMappingUniversal;
};

const convertCardCarouselFieldMappingToUniversal = ({
  fieldMapping,
  fieldMetadataUniversalIdentifierById,
  shouldThrowOnMissingIdentifier,
}: {
  fieldMapping: CardCarouselFieldMapping | null | undefined;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier: boolean;
}): CardCarouselFieldMappingUniversal | null | undefined => {
  if (fieldMapping === undefined || fieldMapping === null) {
    return fieldMapping;
  }

  return Object.fromEntries(
    CARD_CAROUSEL_FIELD_MAPPINGS.flatMap(
      ([fieldMetadataKey, universalIdentifierKey]) => {
        const fieldMetadataId = fieldMapping[fieldMetadataKey];

        return fieldMetadataId === undefined
          ? []
          : [
              [
                universalIdentifierKey,
                fieldMetadataId === null
                  ? null
                  : getFieldMetadataUniversalIdentifier({
                      fieldMetadataId,
                      fieldMetadataUniversalIdentifierById,
                      shouldThrowOnMissingIdentifier,
                    }),
              ],
            ];
      },
    ),
  ) as CardCarouselFieldMappingUniversal;
};

export const fromPageLayoutWidgetConfigurationToUniversalConfiguration = ({
  configuration,
  fieldMetadataUniversalIdentifierById,
  frontComponentUniversalIdentifierById = {},
  viewFieldGroupUniversalIdentifierById:
    _viewFieldGroupUniversalIdentifierById = {},
  viewUniversalIdentifierById = {},
  shouldThrowOnMissingIdentifier = false,
}: {
  configuration: PageLayoutWidgetConfiguration;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  frontComponentUniversalIdentifierById?: Partial<Record<string, string>>;
  viewFieldGroupUniversalIdentifierById?: Partial<Record<string, string>>;
  viewUniversalIdentifierById?: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier?: boolean;
}): UniversalPageLayoutWidgetConfiguration => {
  switch (configuration.configurationType) {
    case WidgetConfigurationType.AGGREGATE_CHART: {
      const {
        aggregateFieldMetadataId,
        ratioAggregateConfig,
        filter,
        ...rest
      } = configuration;

      const aggregateFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: aggregateFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      const universalRatioAggregateConfig = isDefined(ratioAggregateConfig)
        ? {
            optionValue: ratioAggregateConfig.optionValue,
            fieldMetadataUniversalIdentifier:
              getFieldMetadataUniversalIdentifier({
                fieldMetadataId: ratioAggregateConfig.fieldMetadataId,
                fieldMetadataUniversalIdentifierById,
                shouldThrowOnMissingIdentifier,
              }),
          }
        : undefined;

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier,
        ratioAggregateConfig: universalRatioAggregateConfig,
        filter: convertChartFilterToUniversalFilter({
          filter,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        }),
      };
    }

    case WidgetConfigurationType.PIE_CHART: {
      const {
        aggregateFieldMetadataId,
        groupByFieldMetadataId,
        filter,
        ...rest
      } = configuration;

      const aggregateFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: aggregateFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      const groupByFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: groupByFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier,
        groupByFieldMetadataUniversalIdentifier,
        filter: convertChartFilterToUniversalFilter({
          filter,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        }),
      };
    }

    case WidgetConfigurationType.BAR_CHART: {
      const {
        aggregateFieldMetadataId,
        primaryAxisGroupByFieldMetadataId,
        secondaryAxisGroupByFieldMetadataId,
        filter,
        ...rest
      } = configuration;

      const aggregateFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: aggregateFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      const primaryAxisGroupByFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: primaryAxisGroupByFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      const secondaryAxisGroupByFieldMetadataUniversalIdentifier = isDefined(
        secondaryAxisGroupByFieldMetadataId,
      )
        ? getFieldMetadataUniversalIdentifier({
            fieldMetadataId: secondaryAxisGroupByFieldMetadataId,
            fieldMetadataUniversalIdentifierById,
            shouldThrowOnMissingIdentifier,
          })
        : undefined;

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier,
        primaryAxisGroupByFieldMetadataUniversalIdentifier,
        secondaryAxisGroupByFieldMetadataUniversalIdentifier,
        filter: convertChartFilterToUniversalFilter({
          filter,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        }),
      };
    }

    case WidgetConfigurationType.LINE_CHART: {
      const {
        aggregateFieldMetadataId,
        primaryAxisGroupByFieldMetadataId,
        secondaryAxisGroupByFieldMetadataId,
        filter,
        ...rest
      } = configuration;

      const aggregateFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: aggregateFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      const primaryAxisGroupByFieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId: primaryAxisGroupByFieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      const secondaryAxisGroupByFieldMetadataUniversalIdentifier = isDefined(
        secondaryAxisGroupByFieldMetadataId,
      )
        ? getFieldMetadataUniversalIdentifier({
            fieldMetadataId: secondaryAxisGroupByFieldMetadataId,
            fieldMetadataUniversalIdentifierById,
            shouldThrowOnMissingIdentifier,
          })
        : undefined;

      return {
        ...rest,
        aggregateFieldMetadataUniversalIdentifier,
        primaryAxisGroupByFieldMetadataUniversalIdentifier,
        secondaryAxisGroupByFieldMetadataUniversalIdentifier,
        filter: convertChartFilterToUniversalFilter({
          filter,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        }),
      };
    }

    case WidgetConfigurationType.FIELDS: {
      const { viewId, newFieldDefaultVisibility, ...rest } = configuration;

      let viewUniversalIdentifier: string | null = null;

      if (isDefined(viewId)) {
        viewUniversalIdentifier = viewUniversalIdentifierById[viewId] ?? null;

        if (
          !isDefined(viewUniversalIdentifier) &&
          shouldThrowOnMissingIdentifier
        ) {
          throw new FlatEntityMapsException(
            `View universal identifier not found for id: ${viewId}`,
            FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
          );
        }
      }

      return {
        ...rest,
        newFieldDefaultVisibility,
        viewUniversalIdentifier,
      };
    }

    case WidgetConfigurationType.RECORD_TABLE: {
      const { viewId, ...rest } = configuration;

      let viewUniversalIdentifier: string | undefined = undefined;

      if (isDefined(viewId)) {
        viewUniversalIdentifier =
          viewUniversalIdentifierById[viewId] ?? undefined;

        if (
          !isDefined(viewUniversalIdentifier) &&
          shouldThrowOnMissingIdentifier
        ) {
          throw new FlatEntityMapsException(
            `View universal identifier not found for id: ${viewId}`,
            FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
          );
        }
      }

      return {
        ...rest,
        viewId: viewUniversalIdentifier,
      };
    }

    case WidgetConfigurationType.FRONT_COMPONENT: {
      const { frontComponentId, configurationType } = configuration;

      const frontComponentUniversalIdentifier: string | null =
        frontComponentUniversalIdentifierById[frontComponentId] ?? null;

      if (
        !isDefined(frontComponentUniversalIdentifier) &&
        shouldThrowOnMissingIdentifier
      ) {
        throw new FlatEntityMapsException(
          `Front component universal identifier not found for id: ${frontComponentId}`,
          FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
        );
      }

      return {
        configurationType,
        frontComponentUniversalIdentifier,
      };
    }

    case WidgetConfigurationType.FIELD: {
      const { fieldMetadataId, fieldDisplayMode, configurationType, viewId } =
        configuration;

      const fieldMetadataUniversalIdentifier =
        getFieldMetadataUniversalIdentifier({
          fieldMetadataId,
          fieldMetadataUniversalIdentifierById,
          shouldThrowOnMissingIdentifier,
        });

      let viewUniversalIdentifier: string | undefined = undefined;

      if (isDefined(viewId)) {
        viewUniversalIdentifier =
          viewUniversalIdentifierById[viewId] ?? undefined;

        if (
          !isDefined(viewUniversalIdentifier) &&
          shouldThrowOnMissingIdentifier
        ) {
          throw new FlatEntityMapsException(
            `View universal identifier not found for id: ${viewId}`,
            FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
          );
        }
      }

      return {
        configurationType,
        fieldMetadataId: fieldMetadataUniversalIdentifier ?? fieldMetadataId,
        fieldDisplayMode,
        viewId: viewUniversalIdentifier,
      };
    }

    case WidgetConfigurationType.VIEW:
    case WidgetConfigurationType.TIMELINE:
    case WidgetConfigurationType.TASKS:
    case WidgetConfigurationType.NOTES:
    case WidgetConfigurationType.FILES:
    case WidgetConfigurationType.EMAILS:
    case WidgetConfigurationType.CALENDAR:
    case WidgetConfigurationType.FIELD_RICH_TEXT:
    case WidgetConfigurationType.WORKFLOW:
    case WidgetConfigurationType.WORKFLOW_VERSION:
    case WidgetConfigurationType.WORKFLOW_RUN:
    case WidgetConfigurationType.IFRAME:
    case WidgetConfigurationType.STANDALONE_RICH_TEXT:
    case WidgetConfigurationType.EMAIL_THREAD:
      return configuration;
    case WidgetConfigurationType.TASK_TIMELINE: {
      const { fieldMapping, ...rest } = configuration;

      const universalFieldMapping = convertTaskTimelineFieldMappingToUniversal({
        fieldMapping,
        fieldMetadataUniversalIdentifierById,
        shouldThrowOnMissingIdentifier,
      });

      return universalFieldMapping === undefined
        ? rest
        : { ...rest, fieldMapping: universalFieldMapping };
    }
    case WidgetConfigurationType.PERSONAL_FINANCE: {
      const { source, ...rest } = configuration;
      const universalSource = convertPersonalFinanceSourceToUniversal({
        source,
        fieldMetadataUniversalIdentifierById,
        shouldThrowOnMissingIdentifier,
      });

      return universalSource === undefined
        ? rest
        : { ...rest, source: universalSource };
    }
    case WidgetConfigurationType.CARD_CAROUSEL: {
      const { fieldMapping, ...rest } = configuration;

      const universalFieldMapping = convertCardCarouselFieldMappingToUniversal({
        fieldMapping,
        fieldMetadataUniversalIdentifierById,
        shouldThrowOnMissingIdentifier,
      });

      return universalFieldMapping === undefined
        ? rest
        : { ...rest, fieldMapping: universalFieldMapping };
    }
  }
};
