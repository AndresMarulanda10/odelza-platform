import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { createContext, type ReactNode, useContext } from 'react';
import {
  type PersonalFinanceStateEnvelope,
  type WidgetDataState,
} from 'twenty-shared/types';

export type PersonalFinanceDataSource = {
  state?: PersonalFinanceStateEnvelope;
  error?: Error;
  retry?: () => void;
};

const PersonalFinanceDataContext = createContext<
  PersonalFinanceDataSource | undefined
>(undefined);

export const PersonalFinanceDataProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: PersonalFinanceDataSource;
}) => (
  <PersonalFinanceDataContext.Provider value={value}>
    {children}
  </PersonalFinanceDataContext.Provider>
);

export const usePersonalFinanceData = (_widget: PageLayoutWidget) => {
  const source = useContext(PersonalFinanceDataContext);
  const retry = source?.retry ?? (() => undefined);

  if (source?.error) {
    return {
      status: 'error' as WidgetDataState,
      sections: undefined,
      error: source.error,
      retry,
    };
  }

  if (!source?.state) {
    return { status: 'unavailable' as const, sections: undefined, retry };
  }

  return { ...source.state, retry };
};
