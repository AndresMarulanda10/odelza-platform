import { getTriggerIconColor } from '@/workflow/workflow-trigger/utils/getTriggerIconColor';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

describe('getTriggerIconColor', () => {
  it('returns the blue css variable for DATABASE_EVENT', () => {
    expect(getTriggerIconColor('DATABASE_EVENT')).toBe(
      odelzaThemeCssVariables.color.primary,
    );
  });

  it('returns the purple css variable for CRON', () => {
    expect(getTriggerIconColor('CRON')).toBe(
      odelzaThemeCssVariables.color.purple,
    );
  });

  it('returns the purple css variable for MANUAL', () => {
    expect(getTriggerIconColor('MANUAL')).toBe(
      odelzaThemeCssVariables.color.purple,
    );
  });

  it('returns the purple css variable for WEBHOOK', () => {
    expect(getTriggerIconColor('WEBHOOK')).toBe(
      odelzaThemeCssVariables.color.purple,
    );
  });
});
