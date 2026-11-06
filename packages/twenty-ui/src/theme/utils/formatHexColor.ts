import { type RgbColor } from '@ui/theme/utils/parseHexColor';

const toHexChannel = (value: number) =>
  Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, '0');

export const formatHexColor = ({ red, green, blue }: RgbColor) =>
  `#${toHexChannel(red)}${toHexChannel(green)}${toHexChannel(blue)}`.toUpperCase();
