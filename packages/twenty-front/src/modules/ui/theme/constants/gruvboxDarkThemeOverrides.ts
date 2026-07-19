/* oxlint-disable twenty/no-hardcoded-colors -- This module defines the app-local palette. */
import { createGruvboxThemeOverrides } from '@/ui/theme/utils/createGruvboxThemeOverrides';
import { type ThemeOverrides } from 'twenty-ui/theme-constants';

export const GRUVBOX_DARK_THEME_OVERRIDES = createGruvboxThemeOverrides({
  palette: {
    background: ['#1d2021', '#282828', '#32302f', '#3c3836'],
    foreground: ['#fbf1c7', '#ebdbb2', '#d5c4a1', '#bdae93', '#a89984'],
    neutralRamp: [
      '#1d2021',
      '#282828',
      '#32302f',
      '#3c3836',
      '#504945',
      '#665c54',
      '#7c6f64',
      '#a89984',
      '#bdae93',
      '#d5c4a1',
      '#ebdbb2',
      '#fbf1c7',
    ],
    accents: {
      red: '#fb4934',
      green: '#b8bb26',
      yellow: '#fabd2f',
      blue: '#83a598',
      purple: '#d3869b',
      aqua: '#8ec07c',
      orange: '#fe8019',
    },
  },
  invertedBackground: '#fbf1c7',
  invertedForeground: '#1d2021',
  overlay: '#1d2021',
  shadow: '#1d2021',
}) satisfies ThemeOverrides;
