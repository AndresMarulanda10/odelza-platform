import {
  type FinanceBudgetVsActualData,
  type FinanceCategoryAnalysisData,
  type FinanceCashFlowData,
  type FinanceKpiSummaryData,
  type FinanceNetWorthData,
  type FinanceSection,
  type PersonalFinanceStateEnvelope,
} from 'twenty-shared/types';

export type PersonalFinanceAggregationInput = {
  workspaceBaseCurrency: string;
  semanticsApproved: boolean;
  sections: {
    kpiSummary: FinanceSection<FinanceKpiSummaryData>;
    budgetVsActual: FinanceSection<FinanceBudgetVsActualData>;
    cashFlow: FinanceSection<FinanceCashFlowData>;
    categoryAnalysis: FinanceSection<FinanceCategoryAnalysisData>;
    netWorth: FinanceSection<FinanceNetWorthData>;
  };
};

export type PersonalFinanceAggregationResult = PersonalFinanceStateEnvelope;
