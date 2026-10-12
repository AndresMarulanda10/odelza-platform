import { IANA_TIME_ZONES } from 'twenty-shared/constants';
import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { type SelectOption } from 'twenty-ui/input';

const { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } = {
  AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL: IANA_TIME_ZONES.reduce<
    Record<string, SelectOption>
  >((result, ianaTimeZone) => {
    // Cache each label while keeping the exception boundary around formatting only.
    // oxlint-disable-next-line twenty/max-consts-per-file
    let label: string;

    try {
      label = formatTimeZoneLabel(ianaTimeZone);
    } catch (error) {
      // Some browsers do not support every time zone in the shared list.
      if (error instanceof RangeError) {
        return result;
      }

      throw error;
    }

    // Skip time zones with GMT, UTC, or UCT in their name,
    // and duplicates.
    if (
      label.slice(11).includes('GMT') ||
      label.slice(11).includes('UTC') ||
      label.slice(11).includes('UCT') ||
      label in result
    ) {
      return result;
    }

    return {
      ...result,
      [label]: {
        label,
        value: ianaTimeZone,
      },
    };
  }, {}),
};

export { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL };
