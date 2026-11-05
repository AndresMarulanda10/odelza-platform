/* oxlint-disable twenty/no-hardcoded-colors -- This module defines the app-local palette. */
import { createOdelzaThemeOverrides } from '@/ui/theme/utils/createOdelzaThemeOverrides';
import { type ThemeOverrides } from 'twenty-ui/theme-constants';

export const ODELZA_LIGHT_THEME_OVERRIDES = createOdelzaThemeOverrides({
  palette: {
    background: ['#ffffff', '#fffbf0', '#fef6d8', '#e4ddd2'],
    foreground: ['#2d120d', '#5c463f', '#7c6a62', '#928481', '#b8aca5'],
    neutralRamp: [
      '#ffffff',
      '#fffbf0',
      '#fef6d8',
      '#f1eae0',
      '#e4ddd2',
      '#c9bdb4',
      '#928481',
      '#7c6a62',
      '#5c463f',
      '#4a3125',
      '#3a1b15',
      '#2d120d',
    ],
    primary: {
      base: '#6b0b0c',
      hover: '#861518',
      pressed: '#4d0809',
    },
    accents: {
      red: '#b3261e',
      green: '#1f6b3a',
      yellow: '#7a5200',
      blue: '#1d5f9e',
      purple: '#6e3b8f',
      aqua: '#14695f',
      orange: '#9a4310',
    },
  },
  invertedBackground: '#2d120d',
  invertedForeground: '#feefb8',
  overlay: '#2d120d',
  shadow: '#2d120d',
}) satisfies ThemeOverrides;
