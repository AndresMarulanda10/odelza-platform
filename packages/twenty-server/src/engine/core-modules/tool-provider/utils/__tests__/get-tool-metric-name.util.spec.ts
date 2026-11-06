import { getToolMetricName } from '../get-tool-metric-name.util';

describe('conditional update metric cardinality', () => {
  it.each([
    'conditional_update_one_widget',
    'conditional_update_one_widget_conditionally',
    'update_one_widget',
  ])('normalizes %s to the existing operation', (name) =>
    expect(getToolMetricName(name)).toBe('update_one'),
  );
  it('does not commandeer unrelated tool names', () =>
    expect(getToolMetricName('conditionally_update_widget')).toBe(
      'conditionally_update_widget',
    ));
});
