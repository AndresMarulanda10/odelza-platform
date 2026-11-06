import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

describe('getActionIconColorOrThrow', () => {
  it('returns red for CODE, HTTP_REQUEST, SEND_EMAIL, DRAFT_EMAIL, LOGIC_FUNCTION', () => {
    const redActions: WorkflowActionType[] = [
      'CODE',
      'HTTP_REQUEST',
      'SEND_EMAIL',
      'DRAFT_EMAIL',
      'LOGIC_FUNCTION',
    ];
    redActions.forEach((actionType) => {
      expect(getActionIconColorOrThrow(actionType)).toBe(
        odelzaThemeCssVariables.color.red,
      );
    });
  });

  it('returns tertiary font color for record actions', () => {
    const recordActions: WorkflowActionType[] = [
      'CREATE_RECORD',
      'UPDATE_RECORD',
      'DELETE_RECORD',
      'UPSERT_RECORD',
      'FIND_RECORDS',
    ];
    recordActions.forEach((actionType) => {
      expect(getActionIconColorOrThrow(actionType)).toBe(
        odelzaThemeCssVariables.font.color.tertiary,
      );
    });
  });

  it('returns orange for FORM', () => {
    expect(getActionIconColorOrThrow('FORM')).toBe(
      odelzaThemeCssVariables.color.orange,
    );
  });

  it('returns green12 for ITERATOR, EMPTY, FILTER, IF_ELSE, DELAY', () => {
    const greenActions: WorkflowActionType[] = [
      'ITERATOR',
      'EMPTY',
      'FILTER',
      'IF_ELSE',
      'DELAY',
    ];
    greenActions.forEach((actionType) => {
      expect(getActionIconColorOrThrow(actionType)).toBe(
        odelzaThemeCssVariables.color.green12,
      );
    });
  });

  it('returns pink for AI_AGENT', () => {
    expect(getActionIconColorOrThrow('AI_AGENT')).toBe(
      odelzaThemeCssVariables.color.pink,
    );
  });

  it('returns consistent values for repeated calls', () => {
    expect(getActionIconColorOrThrow('CODE')).toBe(
      getActionIconColorOrThrow('CODE'),
    );
  });
});
