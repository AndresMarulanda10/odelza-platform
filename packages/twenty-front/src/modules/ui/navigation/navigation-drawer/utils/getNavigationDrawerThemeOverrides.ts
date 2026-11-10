import { ODELZA_THEME_DARK, ODELZA_THEME_LIGHT } from 'twenty-ui/theme';
import { type ThemeOverrides } from 'twenty-ui/theme-constants';

// The sidebar is rendered with the dark Odelza scheme in both modes so its
// inputs, hovers and icons read on Coffee Bean. These overrides put back the
// navigation roles of the active mode, because the dark scope redefines them.
export const getNavigationDrawerThemeOverrides = (
  colorScheme: 'light' | 'dark',
): ThemeOverrides => {
  const { navigation } =
    colorScheme === 'dark' ? ODELZA_THEME_DARK : ODELZA_THEME_LIGHT;

  return {
    '--odz-navigation-background': navigation.background,
    '--odz-navigation-text': navigation.text,
    '--odz-navigation-text-muted': navigation.textMuted,
    '--odz-navigation-item-hover': navigation.itemHover,
    '--odz-navigation-item-active': navigation.itemActive,
    '--odz-font-color-primary': navigation.text,
    '--odz-font-color-secondary': navigation.text,
    '--odz-font-color-tertiary': navigation.textMuted,
    '--odz-font-color-light': navigation.textMuted,
    '--odz-background-transparent-lighter': navigation.itemHover,
    '--odz-background-transparent-light': navigation.itemHover,
    '--odz-background-transparent-medium': navigation.itemActive,
  };
};
