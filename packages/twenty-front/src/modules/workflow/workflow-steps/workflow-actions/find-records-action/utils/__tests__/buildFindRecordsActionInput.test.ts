import { buildFindRecordsActionInput } from '../buildFindRecordsActionInput';
import { workflowFindRecordsActionSettingsSchema } from 'twenty-shared/workflow';

describe('Find Records editor paging persistence', () => {
  const settings = {
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  };

  it('retains MCP-authored dynamic paging and cursor on unrelated edits', () => {
    const previous = {
      objectName: 'item',
      limit: '{{options.pageSize}}',
      offset: '{{loop.currentItem}}',
      after: '{{previous.pageInfo.endCursor}}',
    };
    const updated = buildFindRecordsActionInput(previous, {
      filter: { recordFilters: [] },
    });
    expect(updated).toMatchObject(previous);
    expect(
      workflowFindRecordsActionSettingsSchema.parse({
        ...settings,
        input: updated,
      }).input,
    ).toEqual(updated);
  });

  it('preserves legacy numeric inputs and allows explicitly clearing the cursor', () => {
    expect(
      buildFindRecordsActionInput(
        { objectName: 'item', limit: 1, offset: 0, after: 'cursor' },
        { after: undefined },
      ),
    ).toEqual({ objectName: 'item', limit: 1, offset: 0, after: undefined });
  });
});
