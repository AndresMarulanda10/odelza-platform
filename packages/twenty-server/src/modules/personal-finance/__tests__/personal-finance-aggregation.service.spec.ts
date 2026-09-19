import { aggregatePersonalFinance } from 'src/modules/personal-finance/personal-finance-aggregation.service';
import { type PersonalFinanceAggregationInput } from 'src/modules/personal-finance/types/personal-finance-aggregation.types';

const context = {
  periodContext: {
    granularity: 'APPROVED_PERIOD',
    start: '2026-01-01',
    end: '2026-01-31',
    timezone: 'UTC',
  },
  comparisonBaseline: { kind: 'APPROVED_BASELINE', start: null, end: null },
  currency: 'USD',
  precision: { amountScale: 2, ratioScale: 2, rounding: 'APPROVED' },
  freshness: '2026-02-01T00:00:00.000Z',
  boundary: { permission: 'granted' as const, sourceStatus: 'available' as const },
};
const sectionContext = () => ({ ...context, boundary: { ...context.boundary } });

const input = (): PersonalFinanceAggregationInput => ({
  workspaceBaseCurrency: 'USD',
  semanticsApproved: true,
  sections: {
    kpiSummary: { ...sectionContext(), status: 'ready', data: { metrics: [] } },
    budgetVsActual: { ...sectionContext(), status: 'ready', data: { rows: [] } },
    cashFlow: {
      ...sectionContext(),
      status: 'ready',
      data: { opening: '1', inflows: '2', outflows: '3', closing: '0' },
    },
    categoryAnalysis: {
      ...sectionContext(),
      status: 'ready',
      data: { categories: [] },
    },
    netWorth: {
      ...sectionContext(),
      status: 'ready',
      data: { assets: '10', liabilities: '4', netWorth: '6' },
    },
  },
});

describe('personal-finance aggregation boundaries', () => {
  it('keeps approved section data and the workspace currency context', () => {
    const result = aggregatePersonalFinance(input());

    expect(result.status).toBe('ready');
    expect(result.sections.netWorth.data?.netWorth).toBe('6');
    expect(result.sections.cashFlow.currency).toBe('USD');
  });

  it('redacts denied and unavailable sections without turning them into zeroes', () => {
    const finance = input();
    finance.sections.netWorth.boundary = {
      permission: 'denied',
      sourceStatus: 'available',
    };
    finance.sections.cashFlow.boundary = {
      permission: 'granted',
      sourceStatus: 'unavailable',
    };

    const result = aggregatePersonalFinance(finance);

    expect(result.status).toBe('partial');
    expect(result.sections.netWorth).toMatchObject({
      status: 'forbidden',
      unavailableReason: 'PERMISSION_DENIED',
    });
    expect(result.sections.netWorth.data).toBeUndefined();
    expect(result.sections.cashFlow).toMatchObject({
      status: 'error',
      unavailableReason: 'SOURCE_UNAVAILABLE',
    });
  });

  it('blocks unapproved semantics and refuses currency conversion', () => {
    const unapproved = aggregatePersonalFinance({
      ...input(),
      semanticsApproved: false,
    });

    expect(unapproved.status).toBe('error');
    expect(unapproved.sections.kpiSummary.data).toBeUndefined();
    expect(unapproved.sections.kpiSummary.unavailableReason).toBe(
      'SEMANTICS_UNCONFIRMED',
    );

    const mismatched = input();
    mismatched.sections.kpiSummary.currency = 'EUR';
    expect(() => aggregatePersonalFinance(mismatched)).toThrow(
      'no conversion is performed',
    );
  });

  it('carries stale freshness as stale instead of reporting ready data', () => {
    const finance = input();
    finance.sections.categoryAnalysis.boundary.sourceStatus = 'stale';

    const result = aggregatePersonalFinance(finance);

    expect(result.status).toBe('partial');
    expect(result.sections.categoryAnalysis).toMatchObject({
      status: 'stale',
      unavailableReason: 'SOURCE_STALE',
    });
  });

  it('preserves loading, empty, error, and partial states without zero filling', () => {
    const finance = input();
    finance.sections.kpiSummary.status = 'loading';
    finance.sections.budgetVsActual.status = 'empty';
    finance.sections.cashFlow.status = 'error';
    finance.sections.categoryAnalysis.status = 'partial';

    const result = aggregatePersonalFinance(finance);

    expect(result.status).toBe('partial');
    expect(result.sections.kpiSummary.data).toBeUndefined();
    expect(result.sections.budgetVsActual.unavailableReason).toBe('NO_DATA');
    expect(result.sections.cashFlow.unavailableReason).toBe('QUERY_FAILED');
    expect(result.sections.categoryAnalysis.data).toEqual({ categories: [] });
  });
});
