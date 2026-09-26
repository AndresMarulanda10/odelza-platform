import { type AggregateOperations } from '../AggregateOperations';
import { type CurrencyCode } from '../../constants/CurrencyCode';
import { type ObjectRecordGroupByDateGranularity } from '../ObjectRecordGroupByDateGranularity';
import { type SerializedRelation } from '../SerializedRelation.type';

import { type ChartFilter } from './chart-filter.type';
import { type RatioAggregateConfig } from './ratio-aggregate-config.type';

type BaseChartConfiguration = {
  aggregateFieldMetadataId: SerializedRelation;
  aggregateOperation: AggregateOperations;
  displayDataLabel?: boolean;
  description?: string;
  color?: string;
  filter?: ChartFilter;
  timezone?: string;
  firstDayOfTheWeek?: number;
};

export type AggregateChartConfiguration = BaseChartConfiguration & {
  configurationType: 'AGGREGATE_CHART';
  label?: string;
  numberFormat?: string;
  prefix?: string;
  suffix?: string;
  ratioAggregateConfig?: RatioAggregateConfig;
};

export type PieChartConfiguration = BaseChartConfiguration & {
  configurationType: 'PIE_CHART';
  groupByFieldMetadataId: SerializedRelation;
  groupBySubFieldName?: string;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  orderBy?: string;
  manualSortOrder?: string[];
  showCenterMetric?: boolean;
  displayLegend?: boolean;
  hideEmptyCategory?: boolean;
  splitMultiValueFields?: boolean;
};

export type BarChartConfiguration = BaseChartConfiguration & {
  configurationType: 'BAR_CHART';
  primaryAxisGroupByFieldMetadataId: SerializedRelation;
  primaryAxisGroupBySubFieldName?: string;
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity;
  primaryAxisOrderBy?: string;
  primaryAxisManualSortOrder?: string[];
  secondaryAxisGroupByFieldMetadataId?: SerializedRelation;
  secondaryAxisGroupBySubFieldName?: string;
  secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity;
  secondaryAxisOrderBy?: string;
  secondaryAxisManualSortOrder?: string[];
  omitNullValues?: boolean;
  splitMultiValueFields?: boolean;
  axisNameDisplay?: string;
  displayLegend?: boolean;
  rangeMin?: number;
  rangeMax?: number;
  groupMode?: string;
  layout?: string;
  isCumulative?: boolean;
};

export type LineChartConfiguration = BaseChartConfiguration & {
  configurationType: 'LINE_CHART';
  primaryAxisGroupByFieldMetadataId: SerializedRelation;
  primaryAxisGroupBySubFieldName?: string;
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity;
  primaryAxisOrderBy?: string;
  primaryAxisManualSortOrder?: string[];
  secondaryAxisGroupByFieldMetadataId?: SerializedRelation;
  secondaryAxisGroupBySubFieldName?: string;
  secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity;
  secondaryAxisOrderBy?: string;
  secondaryAxisManualSortOrder?: string[];
  omitNullValues?: boolean;
  splitMultiValueFields?: boolean;
  axisNameDisplay?: string;
  displayLegend?: boolean;
  rangeMin?: number;
  rangeMax?: number;
  isStacked?: boolean;
  isCumulative?: boolean;
};

export type ViewConfiguration = {
  configurationType: 'VIEW';
};

export type RecordTableConfiguration = {
  configurationType: 'RECORD_TABLE';
  viewId?: string;
  recordLimit?: number;
};

export type FieldConfiguration = {
  configurationType: 'FIELD';
  fieldMetadataId: string;
  fieldDisplayMode: 'CARD' | 'EDITOR' | 'FIELD' | 'VIEW' | 'TABLE';
  viewId?: string;
};

export type FieldsConfiguration = {
  configurationType: 'FIELDS';
  viewId?: SerializedRelation | null;
  newFieldDefaultVisibility?: boolean | null;
  shouldAllowUserToSeeHiddenFields?: boolean;
};

export type FieldRichTextConfiguration = {
  configurationType: 'FIELD_RICH_TEXT';
};

export type StandaloneRichTextConfiguration = {
  configurationType: 'STANDALONE_RICH_TEXT';
  body: {
    blocknote?: string | null;
    markdown: string | null;
  };
};

export type IframeConfiguration = {
  configurationType: 'IFRAME';
  url?: string;
};

export type FrontComponentConfiguration = {
  configurationType: 'FRONT_COMPONENT';
  frontComponentId: SerializedRelation;
};

export type TaskTimelineFieldMapping = {
  titleFieldMetadataId?: SerializedRelation | null;
  startDateFieldMetadataId?: SerializedRelation | null;
  dueDateFieldMetadataId?: SerializedRelation | null;
  progressFieldMetadataId?: SerializedRelation | null;
  statusFieldMetadataId?: SerializedRelation | null;
  milestoneFieldMetadataId?: SerializedRelation | null;
  dependencyFieldMetadataId?: SerializedRelation | null;
  dependencyTypeFieldMetadataId?: SerializedRelation | null;
};

export type TaskTimelineConfiguration = {
  configurationType: 'TASK_TIMELINE';
  fieldMapping?: TaskTimelineFieldMapping | null;
  barColor?: string | null;
};

export type PersonalFinanceSourceMapping = {
  incomeFieldMetadataId?: SerializedRelation | null;
  expenseFieldMetadataId?: SerializedRelation | null;
  budgetFieldMetadataId?: SerializedRelation | null;
  assetFieldMetadataId?: SerializedRelation | null;
  liabilityFieldMetadataId?: SerializedRelation | null;
  dateFieldMetadataId?: SerializedRelation | null;
  categoryFieldMetadataId?: SerializedRelation | null;
};

export type PersonalFinanceConfiguration = {
  configurationType: 'PERSONAL_FINANCE';
  baseCurrencyCode?: CurrencyCode | null;
  source?: PersonalFinanceSourceMapping | null;
};

export type CardCarouselLayout =
  | 'imageTop'
  | 'imageCenter'
  | 'imageOverlay'
  | 'textOnly';

export type CardCarouselImageAspect = 'square' | 'portrait' | 'wide' | 'circle';

export type CardCarouselRadius = 'square' | 'soft' | 'rounded' | 'pill';

export type CardCarouselSize = 'sm' | 'md' | 'lg';

export type CardCarouselTextAlign = 'left' | 'center' | 'right';

export type CardCarouselHoverEffect = 'lift' | 'scale' | 'glow' | 'none';

export type CardCarouselFieldMapping = {
  imageFieldMetadataId?: SerializedRelation | null;
  titleFieldMetadataId?: SerializedRelation | null;
  subtitleFieldMetadataId?: SerializedRelation | null;
  priceFieldMetadataId?: SerializedRelation | null;
};

export type CardCarouselConfiguration = {
  configurationType: 'CARD_CAROUSEL';
  fieldMapping?: CardCarouselFieldMapping | null;
  cardLayout?: CardCarouselLayout | null;
  imageAspect?: CardCarouselImageAspect | null;
  cardRadius?: CardCarouselRadius | null;
  cardSize?: CardCarouselSize | null;
  textAlign?: CardCarouselTextAlign | null;
  hoverEffect?: CardCarouselHoverEffect | null;
  itemCount?: number | null;
};

export type TimelineConfiguration = {
  configurationType: 'TIMELINE';
};

export type TasksConfiguration = {
  configurationType: 'TASKS';
};

export type NotesConfiguration = {
  configurationType: 'NOTES';
};

export type FilesConfiguration = {
  configurationType: 'FILES';
};

export type EmailsConfiguration = {
  configurationType: 'EMAILS';
};

export type EmailThreadConfiguration = {
  configurationType: 'EMAIL_THREAD';
};

export type CalendarConfiguration = {
  configurationType: 'CALENDAR';
};

export type WorkflowConfiguration = {
  configurationType: 'WORKFLOW';
};

export type WorkflowVersionConfiguration = {
  configurationType: 'WORKFLOW_VERSION';
};

export type WorkflowRunConfiguration = {
  configurationType: 'WORKFLOW_RUN';
};

export type WidgetDataState =
  | 'loading'
  | 'ready'
  | 'empty'
  | 'partial'
  | 'stale'
  | 'error'
  | 'forbidden';

export type TaskTimelineItem = {
  id: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  progress: number | null;
  isMilestone: boolean;
  dependencies: TaskDependency[];
  conflict: boolean;
};

export type TaskDependency = {
  predecessorId: string;
  successorId: string;
  type: 'FINISH_TO_START';
  conflict: boolean;
};

export type TaskTimelineStateEnvelope = {
  status: WidgetDataState;
  items?: TaskTimelineItem[];
};

export type FinancePeriodContext = {
  granularity: string;
  start: string;
  end: string;
  timezone: string;
};

export type FinanceComparisonBaseline = {
  kind: string;
  start: string | null;
  end: string | null;
};

export type FinancePrecision = {
  amountScale: number;
  ratioScale: number;
  rounding: string;
};

export type FinanceSectionKey =
  | 'kpiSummary'
  | 'budgetVsActual'
  | 'cashFlow'
  | 'categoryAnalysis'
  | 'netWorth';

export type FinanceSectionBoundary = {
  permission: 'granted' | 'denied';
  sourceStatus: 'available' | 'unavailable' | 'stale';
};

export type FinanceUnavailableReason =
  | 'PERMISSION_DENIED'
  | 'SOURCE_UNAVAILABLE'
  | 'SOURCE_STALE'
  | 'SEMANTICS_UNCONFIRMED'
  | 'QUERY_FAILED'
  | 'NO_DATA';

export type FinanceMetric = {
  key: string;
  value: string;
  label?: string;
};

export type FinanceKpiSummaryData = { metrics: FinanceMetric[] };
export type FinanceBudgetVsActualData = {
  rows: Array<{
    category: string;
    budget: string;
    actual: string;
    variance: string;
  }>;
};
export type FinanceCashFlowData = {
  opening: string;
  inflows: string;
  outflows: string;
  closing: string;
};
export type FinanceCategoryAnalysisData = {
  categories: Array<{ category: string; amount: string; share: string | null }>;
};
export type FinanceNetWorthData = {
  assets: string;
  liabilities: string;
  netWorth: string;
};

export type FinanceSection<TData = unknown> = {
  status: WidgetDataState;
  periodContext: FinancePeriodContext;
  comparisonBaseline: FinanceComparisonBaseline;
  currency: string;
  precision: FinancePrecision;
  freshness: string | null;
  boundary: FinanceSectionBoundary;
  unavailableReason?: FinanceUnavailableReason;
  data?: TData;
};

export type PersonalFinanceStateEnvelope = {
  status: WidgetDataState;
  sections: {
    kpiSummary: FinanceSection<FinanceKpiSummaryData>;
    budgetVsActual: FinanceSection<FinanceBudgetVsActualData>;
    cashFlow: FinanceSection<FinanceCashFlowData>;
    categoryAnalysis: FinanceSection<FinanceCategoryAnalysisData>;
    netWorth: FinanceSection<FinanceNetWorthData>;
  };
};

export type PageLayoutWidgetConfiguration =
  | AggregateChartConfiguration
  | PieChartConfiguration
  | BarChartConfiguration
  | LineChartConfiguration
  | ViewConfiguration
  | RecordTableConfiguration
  | FieldConfiguration
  | FieldsConfiguration
  | FieldRichTextConfiguration
  | StandaloneRichTextConfiguration
  | IframeConfiguration
  | FrontComponentConfiguration
  | TaskTimelineConfiguration
  | PersonalFinanceConfiguration
  | CardCarouselConfiguration
  | TimelineConfiguration
  | TasksConfiguration
  | NotesConfiguration
  | FilesConfiguration
  | EmailsConfiguration
  | CalendarConfiguration
  | WorkflowConfiguration
  | WorkflowVersionConfiguration
  | WorkflowRunConfiguration
  | EmailThreadConfiguration;
