import { type AggregateOperations } from 'twenty-shared/types';

export type GroupByRecordsResult = {
  groups: Array<{ dimensions: unknown[]; value: string | number | null }>;
  dimensionLabels: string[];
  aggregation: keyof typeof AggregateOperations;
  groupCount: number;
  hasMore: boolean;
  isComplete: boolean;
};
