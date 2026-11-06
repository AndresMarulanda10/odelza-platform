import { formatHexColor } from '@ui/theme/utils/formatHexColor';
import { parseHexColor } from '@ui/theme/utils/parseHexColor';

export const withHexAlpha = (hexColor: string, alpha: number) => {
  const alphaChannel = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

  return `${formatHexColor(parseHexColor(hexColor))}${alphaChannel}`;
};
