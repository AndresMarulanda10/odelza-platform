import { getTaskDefaultDueAt } from '@/activities/utils/getTaskDefaultDueAt';

describe('getTaskDefaultDueAt', () => {
  it.each([new Date(2026, 6, 14, 8, 30), new Date(2026, 6, 14, 17, 30)])(
    'returns 9 AM on the current local day when now is %s',
    (now) => {
      const expectedDueAt = new Date(now);

      expectedDueAt.setHours(9, 0, 0, 0);

      expect(getTaskDefaultDueAt(now)).toBe(expectedDueAt.toISOString());
    },
  );
});
