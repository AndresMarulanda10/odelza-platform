import { generateGroupByRecordsOutputSchema } from '../generateGroupByRecordsOutputSchema';
import { computeStepOutputSchema } from '../computeStepOutputSchema';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';

describe('group records output variables', () => {
  it('keeps generic dimension and aggregate samples neutral under the standard inference helper', () => {
    const groups = generateGroupByRecordsOutputSchema().groups;
    if (!groups.isLeaf || !Array.isArray(groups.value))
      throw new Error('Expected groups array');
    const item = getOutputSchemaFromValue(groups.value[0]);
    const dimensions = item.dimensions;
    if (!dimensions.isLeaf || !Array.isArray(dimensions.value))
      throw new Error('Expected dimensions array');
    expect(
      getOutputSchemaFromValue({ dimension: dimensions.value[0] }).dimension
        .type,
    ).toBe('unknown');
    expect(item.value.type).toBe('unknown');
  });
  it('uses standard arrays with inspectable iterator samples and truthful completeness fields', () => {
    const schema = generateGroupByRecordsOutputSchema();
    expect(schema.groups).toEqual({
      isLeaf: true,
      type: 'array',
      label: 'groups',
      value: [{ dimensions: [null], value: null }],
    });
    expect(schema.groupCount.type).toBe('number');
    expect(schema.hasMore.type).toBe('boolean');
    expect(schema.isComplete.type).toBe('boolean');
    expect(schema).not.toHaveProperty('totalCount');
    expect(
      computeStepOutputSchema({
        step: { type: 'GROUP_BY_RECORDS' } as never,
        objectMetadataItems: [],
      }),
    ).toEqual(schema);
    expect(getActionIcon('GROUP_BY_RECORDS')).toBe('IconSum');
  });
});
