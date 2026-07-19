/* oxlint-disable twenty/no-hardcoded-colors -- This module defines the app-local palette. */
import { createGruvboxThemeOverrides } from '@/ui/theme/utils/createGruvboxThemeOverrides';
import { type ThemeOverrides } from 'twenty-ui/theme-constants';

export const GRUVBOX_LIGHT_THEME_OVERRIDES = createGruvboxThemeOverrides({
  palette: {
    background: ['#f9f5d7', '#fbf1c7', '#f2e5bc', '#ebdbb2'],
    foreground: ['#282828', '#3c3836', '#504945', '#665c54', '#7c6f64'],
    neutralRamp: [
      '#f9f5d7',
      '#fbf1c7',
      '#f2e5bc',
      '#ebdbb2',
      '#d5c4a1',
      '#bdae93',
      '#a89984',
      '#7c6f64',
      '#665c54',
      '#504945',
      '#3c3836',
      '#282828',
    ],
    accents: {
      red: '#9d0006',
      green: '#79740e',
      yellow: '#b57614',
      blue: '#076678',
      purple: '#8f3f71',
      aqua: '#427b58',
      orange: '#af3a03',
    },
  },
  invertedBackground: '#282828',
  invertedForeground: '#fbf1c7',
  overlay: '#282828',
  shadow: '#282828',
}) satisfies ThemeOverrides;
