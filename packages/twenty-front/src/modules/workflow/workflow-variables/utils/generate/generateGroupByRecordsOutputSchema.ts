import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';

export const generateGroupByRecordsOutputSchema = () =>
  getOutputSchemaFromValue({
    groups: [{ dimensions: [null], value: null }],
    dimensionLabels: ['field'],
    aggregation: 'COUNT',
    groupCount: 1,
    hasMore: false,
    isComplete: true,
  });
