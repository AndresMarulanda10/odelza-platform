import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { usePersonalFinanceData } from '@/page-layout/widgets/personal-finance/hooks/usePersonalFinanceData';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import {
  type FinanceSection,
  type PersonalFinanceStateEnvelope,
} from 'twenty-shared/types';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledState = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  min-height: 120px;
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledSection = styled.section`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledContext = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledNotice = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledError = styled(StyledNotice)`
  color: ${themeCssVariables.font.color.danger};
`;

const StyledValues = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const StyledValue = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const SectionContext = ({ section }: { section: FinanceSection }) => (
  <StyledContext>
    <span>
      {t`Period`}: {section.periodContext.start}–{section.periodContext.end} (
      {section.periodContext.granularity}, {section.periodContext.timezone})
    </span>
    <span>
      {t`Comparison`}: {section.comparisonBaseline.kind}
      {section.comparisonBaseline.start && section.comparisonBaseline.end
        ? ` (${section.comparisonBaseline.start}–${section.comparisonBaseline.end})`
        : ''}
    </span>
    <span>
      {t`Currency`}: {section.currency}
    </span>
    <span>
      {t`Precision`}: {section.precision.amountScale}/
      {section.precision.ratioScale} ({section.precision.rounding})
    </span>
    <span>
      {t`Freshness`}: {section.freshness ?? t`Unavailable`}
    </span>
  </StyledContext>
);

const SectionCard = <TData,>({
  title,
  section,
  children,
}: {
  title: string;
  section: FinanceSection<TData>;
  children: (data: TData) => ReactNode;
}) => {
  const state = (() => {
    switch (section.status) {
      case 'loading':
        return (
          <StyledState role="status">{t`Loading financial data…`}</StyledState>
        );
      case 'forbidden':
        return (
          <StyledState role="alert">{t`Access to this section is denied.`}</StyledState>
        );
      case 'error':
        return (
          <StyledError role="alert">{t`This section could not be loaded.`}</StyledError>
        );
      case 'empty':
        return (
          <StyledState role="status">{t`No approved data for this period.`}</StyledState>
        );
      default:
        return section.data === undefined ? (
          <StyledState role="status">{t`Financial data is unavailable.`}</StyledState>
        ) : null;
    }
  })();

  return (
    <StyledSection aria-label={title}>
      <strong>{title}</strong>
      <SectionContext section={section} />
      {state}
      {state === null && section.data !== undefined && (
        <>
          {section.status === 'partial' && (
            <StyledNotice role="status">{t`Some values are unavailable.`}</StyledNotice>
          )}
          {section.status === 'stale' && (
            <StyledNotice role="status">{t`This data may be stale.`}</StyledNotice>
          )}
          {children(section.data)}
        </>
      )}
    </StyledSection>
  );
};

const FinanceSections = ({
  sections,
}: {
  sections: PersonalFinanceStateEnvelope['sections'];
}) => (
  <StyledGrid>
    <SectionCard title={t`KPI summary`} section={sections.kpiSummary}>
      {(data) => (
        <StyledValues>
          {data.metrics.map((metric) => (
            <StyledValue key={metric.key}>
              <StyledLabel>{metric.label ?? metric.key}</StyledLabel>
              <strong>{metric.value}</strong>
            </StyledValue>
          ))}
        </StyledValues>
      )}
    </SectionCard>
    <SectionCard
      title={t`Budget versus actual`}
      section={sections.budgetVsActual}
    >
      {(data) => (
        <StyledValues role="list" aria-label={t`Budget versus actual rows`}>
          {data.rows.map((row) => (
            <StyledValue key={row.category} role="listitem">
              <StyledLabel>{row.category}</StyledLabel>
              <span>
                {t`Budget`}: {row.budget}; {t`Actual`}: {row.actual};{' '}
                {t`Variance`}: {row.variance}
              </span>
            </StyledValue>
          ))}
        </StyledValues>
      )}
    </SectionCard>
    <SectionCard title={t`Cash flow`} section={sections.cashFlow}>
      {(data) => (
        <StyledValues>
          {Object.entries(data).map(([key, value]) => (
            <StyledValue key={key}>
              <StyledLabel>{key}</StyledLabel>
              <strong>{value}</strong>
            </StyledValue>
          ))}
        </StyledValues>
      )}
    </SectionCard>
    <SectionCard
      title={t`Category analysis`}
      section={sections.categoryAnalysis}
    >
      {(data) => (
        <StyledValues role="list" aria-label={t`Category analysis rows`}>
          {data.categories.map((row) => (
            <StyledValue key={row.category} role="listitem">
              <StyledLabel>{row.category}</StyledLabel>
              <span>
                {t`Amount`}: {row.amount}; {t`Share`}:{' '}
                {row.share ?? t`Unavailable`}
              </span>
            </StyledValue>
          ))}
        </StyledValues>
      )}
    </SectionCard>
    <SectionCard title={t`Net worth`} section={sections.netWorth}>
      {(data) => (
        <StyledValues>
          <StyledValue>
            <StyledLabel>{t`Assets`}</StyledLabel>
            <strong>{data.assets}</strong>
          </StyledValue>
          <StyledValue>
            <StyledLabel>{t`Liabilities`}</StyledLabel>
            <strong>{data.liabilities}</strong>
          </StyledValue>
          <StyledValue>
            <StyledLabel>{t`Net worth`}</StyledLabel>
            <strong>{data.netWorth}</strong>
          </StyledValue>
        </StyledValues>
      )}
    </SectionCard>
  </StyledGrid>
);

export const PersonalFinanceWidget = ({
  widget,
}: {
  widget: PageLayoutWidget;
}) => {
  const { status, sections, error, retry } = usePersonalFinanceData(widget);

  if (status === 'unavailable') {
    return (
      <StyledState role="status">
        <strong>{t`Personal-finance data unavailable`}</strong>
        <span>{t`An approved finance data source is required; no financial values were inferred.`}</span>
      </StyledState>
    );
  }

  if (!sections) {
    if (status === 'loading') return <WidgetSkeletonLoader />;
    return (
      <StyledState role="alert">
        <strong>{t`Unable to load personal-finance data`}</strong>
        <span>
          {error?.message ?? t`An error occurred while loading financial data.`}
        </span>
        <button type="button" onClick={retry}>{t`Retry`}</button>
      </StyledState>
    );
  }

  return (
    <StyledContainer role="region" aria-label={t`Personal-finance dashboard`}>
      <StyledNotice>
        {status === 'partial'
          ? t`Some finance sections are unavailable.`
          : status === 'error'
            ? t`Some finance sections could not be loaded.`
            : null}
      </StyledNotice>
      <FinanceSections sections={sections} />
    </StyledContainer>
  );
};
