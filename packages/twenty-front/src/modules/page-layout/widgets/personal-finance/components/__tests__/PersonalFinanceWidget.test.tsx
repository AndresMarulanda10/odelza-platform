import { render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PersonalFinanceDataProvider } from '@/page-layout/widgets/personal-finance/hooks/usePersonalFinanceData';
import { PersonalFinanceWidget } from '@/page-layout/widgets/personal-finance/components/PersonalFinanceWidget';
import {
  type FinanceSection,
  type PersonalFinanceStateEnvelope,
} from 'twenty-shared/types';

const widget = { id: 'finance-widget' } as PageLayoutWidget;

const section = <T,>(
  data: T,
  status: FinanceSection<T>['status'] = 'ready',
): FinanceSection<T> => ({
  status,
  periodContext: {
    granularity: 'month',
    start: '2026-09-01',
    end: '2026-09-30',
    timezone: 'UTC',
  },
  comparisonBaseline: { kind: 'none', start: null, end: null },
  currency: 'USD',
  precision: { amountScale: 2, ratioScale: 2, rounding: 'half-up' },
  freshness: '2026-09-19T00:00:00Z',
  boundary: { permission: 'granted', sourceStatus: 'available' },
  data,
});

const envelope: PersonalFinanceStateEnvelope = {
  status: 'ready',
  sections: {
    kpiSummary: section({
      metrics: [{ key: 'income', label: 'Income', value: '$100' }],
    }),
    budgetVsActual: section({
      rows: [
        { category: 'Housing', budget: '$50', actual: '$40', variance: '$10' },
      ],
    }),
    cashFlow: section({
      opening: '$20',
      inflows: '$100',
      outflows: '$40',
      closing: '$80',
    }),
    categoryAnalysis: section({
      categories: [{ category: 'Housing', amount: '$40', share: '40%' }],
    }),
    netWorth: section({ assets: '$200', liabilities: '$50', netWorth: '$150' }),
  },
};

describe('PersonalFinanceWidget', () => {
  it('uses card-width queries and retains local vertical overflow', () => {
    // Container queries are not computed by JSDOM; this checks CSS policy.
    const source = readFileSync(
      resolve(__dirname, '../PersonalFinanceWidget.tsx'),
      'utf8',
    );
    const css = (name: string) =>
      source.split(`const ${name} = styled.div\``)[1].split('`;')[0];
    const root = css('StyledContainer');
    for (const rule of [
      'box-sizing: border-box',
      'container-name: personal-finance',
      'container-type: inline-size',
      'height: 100%',
      'min-height: 0',
      'overflow: auto',
      'overflow-wrap: anywhere',
    ]) {
      expect(root).toContain(rule);
    }
    expect(css('StyledGrid')).toContain('flex-shrink: 0');
    expect(css('StyledGrid')).toContain(
      '@container personal-finance (max-width: 36rem)',
    );
    expect(css('StyledValues')).toContain(
      '@container personal-finance (max-width: 24rem)',
    );
    for (const name of ['StyledGrid', 'StyledValues']) {
      expect(css(name)).toContain('grid-template-columns: minmax(0, 1fr)');
      expect(css(name)).not.toContain('@media');
    }
    expect(css('StyledState')).toContain('overflow: auto');
  });

  it('preserves long values and all sections in a keyboard-scrollable region', () => {
    const longLabel = 'LongFinanceLabel'.repeat(20);
    const longValue = '1234567890'.repeat(20);
    render(
      <PersonalFinanceDataProvider
        value={{
          state: {
            ...envelope,
            sections: {
              ...envelope.sections,
              kpiSummary: section({
                metrics: [{ key: 'long', label: longLabel, value: longValue }],
              }),
            },
          },
        }}
      >
        <PersonalFinanceWidget widget={widget} />
      </PersonalFinanceDataProvider>,
    );
    const dashboard = screen.getByRole('region', {
      name: 'Personal-finance dashboard',
    });
    expect(dashboard).toHaveAttribute('tabindex', '0');
    expect(within(dashboard).getByText(longLabel)).toBeInTheDocument();
    expect(within(dashboard).getByText(longValue)).toBeInTheDocument();
    expect(within(dashboard).getAllByRole('region')).toHaveLength(5);
  });
  it('renders section values and their approved context as text equivalents', () => {
    render(
      <PersonalFinanceDataProvider value={{ state: envelope }}>
        <PersonalFinanceWidget widget={widget} />
      </PersonalFinanceDataProvider>,
    );

    expect(
      screen.getByRole('region', { name: 'Personal-finance dashboard' }),
    ).toBeVisible();
    expect(
      screen.getByRole('region', { name: 'Personal-finance dashboard' }),
    ).toHaveTextContent('Period: 2026-09-01–2026-09-30 (month, UTC)');
    expect(
      screen.getByRole('region', { name: 'Personal-finance dashboard' }),
    ).toHaveTextContent('Currency: USD');
    const kpiSection = screen.getByRole('region', { name: 'KPI summary' });
    expect(within(kpiSection).getByText('Income')).toBeVisible();
    expect(within(kpiSection).getByText('$100')).toBeVisible();
    expect(
      screen.getByText('Budget: $50; Actual: $40; Variance: $10'),
    ).toBeVisible();
    expect(screen.getByRole('region', { name: 'Net worth' })).toHaveTextContent(
      'Net worth',
    );
  });

  it('keeps unavailable sections distinct from zero-valued data', () => {
    const partialEnvelope: PersonalFinanceStateEnvelope = {
      ...envelope,
      status: 'partial',
      sections: {
        ...envelope.sections,
        cashFlow: {
          ...envelope.sections.cashFlow,
          status: 'forbidden',
          data: undefined,
        },
      },
    };

    render(
      <PersonalFinanceDataProvider value={{ state: partialEnvelope }}>
        <PersonalFinanceWidget widget={widget} />
      </PersonalFinanceDataProvider>,
    );

    const cashFlowSection = screen.getByRole('region', { name: 'Cash flow' });
    expect(
      within(cashFlowSection).getByText('Access to this section is denied.'),
    ).toHaveAttribute('role', 'alert');
    expect(
      screen.getByText('Some finance sections are unavailable.'),
    ).toBeVisible();
    expect(
      within(cashFlowSection).queryByText('opening'),
    ).not.toBeInTheDocument();
  });
});
