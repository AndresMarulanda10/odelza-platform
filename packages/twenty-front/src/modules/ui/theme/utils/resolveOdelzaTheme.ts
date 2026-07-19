import { GRUVBOX_DARK_THEME_OVERRIDES } from '@/ui/theme/constants/gruvboxDarkThemeOverrides';
import { GRUVBOX_LIGHT_THEME_OVERRIDES } from '@/ui/theme/constants/gruvboxLightThemeOverrides';
import { type ColorScheme } from 'twenty-ui/input';
import { type ThemeOverrides } from 'twenty-ui/theme-constants';

export const applyOdelzaThemeToRoot = (overrides: ThemeOverrides) => {
  if (typeof document === 'undefined') return () => {};

  const rootStyle = document.documentElement.style;
  const previousValues = Object.keys(overrides).map((property) => [
    property,
    rootStyle.getPropertyValue(property),
    rootStyle.getPropertyPriority(property),
  ]);

  for (const [property, value] of Object.entries(overrides)) {
    rootStyle.setProperty(property, String(value));
  }

  return () => {
    for (const [property, value, priority] of previousValues) {
      if (value === '') rootStyle.removeProperty(property);
      else rootStyle.setProperty(property, value, priority);
    }
  };
};

export const resolveOdelzaTheme = (
  persistedColorScheme: ColorScheme,
  systemColorScheme: ColorScheme,
) => {
  const effectiveColorScheme =
    persistedColorScheme === 'System'
      ? systemColorScheme
      : persistedColorScheme;
  const colorScheme = effectiveColorScheme === 'Dark' ? 'dark' : 'light';

  return {
    colorScheme,
    overrides:
      colorScheme === 'dark'
        ? GRUVBOX_DARK_THEME_OVERRIDES
        : GRUVBOX_LIGHT_THEME_OVERRIDES,
  } as const;
};
