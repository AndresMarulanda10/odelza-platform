import { type ThemeColor } from '@ui/theme';
import { odelzaThemeCssVariables } from '@ui/theme-constants';

export const getColorFromTheme = (
  themeColor: ThemeColor,
  shade: number,
): string => {
  const colorMap = odelzaThemeCssVariables.color as unknown as Record<
    string,
    string
  >;
  const tagText = odelzaThemeCssVariables.tag.text as unknown as Record<
    string,
    string
  >;
  const key = `${themeColor}${shade}`;
  return colorMap[key] ?? tagText[themeColor];
};
