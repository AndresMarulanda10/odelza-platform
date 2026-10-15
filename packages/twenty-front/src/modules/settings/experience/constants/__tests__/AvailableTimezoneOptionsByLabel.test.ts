import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { IANA_TIME_ZONES } from 'twenty-shared/constants';

jest.mock('twenty-shared/constants', () => ({
  IANA_TIME_ZONES: [
    'Europe/Paris',
    'CST6CDT',
    'Europe/ParisAlias',
    'Etc/GMT',
    'Etc/UTC',
    'Etc/UCT',
    'Asia/Tokyo',
  ],
}));

jest.mock('@/localization/utils/formatTimeZoneLabel', () => ({
  formatTimeZoneLabel: jest.fn(),
}));

describe('AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL initialization', () => {
  const labels: Record<string, string> = {
    'Europe/Paris': '(GMT+01:00) Central European Time - Paris',
    'Europe/ParisAlias': '(GMT+01:00) Central European Time - Paris',
    'Etc/GMT': '(GMT+00:00) GMT',
    'Etc/UTC': '(GMT+00:00) UTC',
    'Etc/UCT': '(GMT+00:00) UCT',
    'Asia/Tokyo': '(GMT+09:00) Japan Standard Time - Tokyo',
  };

  beforeEach(() => {
    jest.mocked(formatTimeZoneLabel).mockReset();
  });

  it('skips unsupported zones while preserving valid options, filters, and first-label deduplication', () => {
    jest.mocked(formatTimeZoneLabel).mockImplementation((zone) => {
      if (zone === 'CST6CDT') {
        throw new RangeError('Invalid time zone specified: CST6CDT');
      }

      return labels[zone];
    });

    jest.isolateModules(() => {
      const {
        AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL,
      } = require('@/settings/experience/constants/AvailableTimezoneOptionsByLabel');

      expect(AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL).toEqual({
        [labels['Europe/Paris']]: {
          label: labels['Europe/Paris'],
          value: 'Europe/Paris',
        },
        [labels['Asia/Tokyo']]: {
          label: labels['Asia/Tokyo'],
          value: 'Asia/Tokyo',
        },
      });
    });

    expect(jest.mocked(formatTimeZoneLabel).mock.calls).toEqual(
      IANA_TIME_ZONES.map((zone) => [zone]),
    );
  });

  it('does not hide unrelated formatter errors', () => {
    const error = new TypeError('Unexpected formatter bug');

    jest.mocked(formatTimeZoneLabel).mockImplementation(() => {
      throw error;
    });

    expect(() => {
      jest.isolateModules(() => {
        require('@/settings/experience/constants/AvailableTimezoneOptionsByLabel');
      });
    }).toThrow(error);
  });
});
