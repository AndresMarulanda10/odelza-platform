import {
  type FinanceSection,
  type PersonalFinanceStateEnvelope,
  type WidgetDataState,
} from 'twenty-shared/types';

import {
  type PersonalFinanceAggregationInput,
  type PersonalFinanceAggregationResult,
} from 'src/modules/personal-finance/types/personal-finance-aggregation.types';

const withoutData = <TData>(
  section: FinanceSection<TData>,
  status: WidgetDataState,
  unavailableReason: FinanceSection<TData>['unavailableReason'],
): FinanceSection<TData> => {
  const { data: _data, ...withoutData } = section;

  return { ...withoutData, status, unavailableReason };
};

const normalizeSection = <TData>(
  section: FinanceSection<TData>,
  workspaceBaseCurrency: string,
  semanticsApproved: boolean,
): FinanceSection<TData> => {
  if (section.currency !== workspaceBaseCurrency) {
    throw new Error(
      'Personal-finance sections must use the workspace base currency; no conversion is performed',
    );
  }

  if (!semanticsApproved) {
    return withoutData(section, 'error', 'SEMANTICS_UNCONFIRMED');
  }

  if (section.boundary.permission === 'denied') {
    return withoutData(section, 'forbidden', 'PERMISSION_DENIED');
  }

  if (section.status === 'forbidden') {
    return withoutData(section, 'forbidden', 'PERMISSION_DENIED');
  }

  if (section.status === 'loading') {
    return withoutData(section, 'loading', undefined);
  }

  if (section.status === 'error') {
    return withoutData(section, 'error', 'QUERY_FAILED');
  }

  if (section.status === 'empty') {
    return withoutData(section, 'empty', 'NO_DATA');
  }

  if (section.boundary.sourceStatus === 'unavailable') {
    return withoutData(section, 'error', 'SOURCE_UNAVAILABLE');
  }

  if (section.boundary.sourceStatus === 'stale') {
    return { ...section, status: 'stale', unavailableReason: 'SOURCE_STALE' };
  }

  if (section.status === 'stale') {
    return { ...section, status: 'stale', unavailableReason: 'SOURCE_STALE' };
  }

  if (section.status === 'partial' && section.data === undefined) {
    return withoutData(section, 'partial', 'SOURCE_UNAVAILABLE');
  }

  if (section.data === undefined) {
    return withoutData(section, 'empty', 'NO_DATA');
  }

  return {
    ...section,
    status: section.status === 'partial' ? 'partial' : 'ready',
  };
};

const getOverallStatus = (
  sections: PersonalFinanceStateEnvelope['sections'],
): WidgetDataState => {
  const statuses = Object.values(sections).map(({ status }) => status);

  return new Set(statuses).size === 1 ? statuses[0] : 'partial';
};

export const aggregatePersonalFinance = ({
  workspaceBaseCurrency,
  semanticsApproved,
  sections: inputSections,
}: PersonalFinanceAggregationInput): PersonalFinanceAggregationResult => {
  const sections = {
    kpiSummary: normalizeSection(
      inputSections.kpiSummary,
      workspaceBaseCurrency,
      semanticsApproved,
    ),
    budgetVsActual: normalizeSection(
      inputSections.budgetVsActual,
      workspaceBaseCurrency,
      semanticsApproved,
    ),
    cashFlow: normalizeSection(
      inputSections.cashFlow,
      workspaceBaseCurrency,
      semanticsApproved,
    ),
    categoryAnalysis: normalizeSection(
      inputSections.categoryAnalysis,
      workspaceBaseCurrency,
      semanticsApproved,
    ),
    netWorth: normalizeSection(
      inputSections.netWorth,
      workspaceBaseCurrency,
      semanticsApproved,
    ),
  };

  return { status: getOverallStatus(sections), sections };
};
