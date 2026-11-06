import { ODELZA_COLOR_FAMILIES } from '@ui/theme/constants/OdelzaColorFamilies';

export type ThemeColor = keyof typeof ODELZA_COLOR_FAMILIES;

export const MAIN_COLOR_NAMES = Object.keys(
  ODELZA_COLOR_FAMILIES,
) as ThemeColor[];
