import { formatHexColor } from '@ui/theme/utils/formatHexColor';
import { parseHexColor } from '@ui/theme/utils/parseHexColor';

// weight 0 returns fromColor, weight 1 returns toColor
export const mixHexColors = (
  fromColor: string,
  toColor: string,
  weight: number,
) => {
  const from = parseHexColor(fromColor);
  const to = parseHexColor(toColor);

  return formatHexColor({
    red: from.red + (to.red - from.red) * weight,
    green: from.green + (to.green - from.green) * weight,
    blue: from.blue + (to.blue - from.blue) * weight,
  });
};
