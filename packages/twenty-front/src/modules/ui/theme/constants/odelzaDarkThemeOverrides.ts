/* oxlint-disable twenty/no-hardcoded-colors -- This module defines the app-local palette. */
import { createOdelzaThemeOverrides } from '@/ui/theme/utils/createOdelzaThemeOverrides';
import { type ThemeOverrides } from 'twenty-ui/theme-constants';

export const ODELZA_DARK_THEME_OVERRIDES = createOdelzaThemeOverrides({
  palette: {
    background: ['#1a0c09', '#2d120d', '#3a1b15', '#47241c'],
    foreground: ['#f6e9bf', '#cdb98f', '#a39279', '#8f6f63', '#6e5249'],
    neutralRamp: [
      '#1a0c09',
      '#2d120d',
      '#3a1b15',
      '#47241c',
      '#4a2d25',
      '#5b4333',
      '#8f6f63',
      '#a39279',
      '#b8a584',
      '#cdb98f',
      '#dccb9e',
      '#f6e9bf',
    ],
    // Deeper than the brand guide's #e0645b because twenty-ui renders primary
    // button labels in fixed white, which needs 4.5:1 contrast
    primary: {
      base: '#cf3b30',
      hover: '#c6392f',
      pressed: '#b6342b',
    },
    accents: {
      red: '#ff9a90',
      green: '#7ed494',
      yellow: '#f2c14e',
      blue: '#8ebbef',
      purple: '#c9a2e6',
      aqua: '#6fcdbe',
      orange: '#f2a065',
    },
  },
  invertedBackground: '#f6e9bf',
  invertedForeground: '#2d120d',
  overlay: '#140806',
  shadow: '#140806',
}) satisfies ThemeOverrides;
