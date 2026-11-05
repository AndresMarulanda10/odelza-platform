/* oxlint-disable twenty/no-hardcoded-colors -- Exact palette values are the contract under test. */
import { ODELZA_DARK_THEME_OVERRIDES } from '@/ui/theme/constants/odelzaDarkThemeOverrides';
import { ODELZA_LIGHT_THEME_OVERRIDES } from '@/ui/theme/constants/odelzaLightThemeOverrides';
import {
  applyOdelzaThemeToRoot,
  resolveOdelzaTheme,
} from '@/ui/theme/utils/resolveOdelzaTheme';

describe('resolveOdelzaTheme', () => {
  it('selects Odelza Light for Light', () => {
    expect(resolveOdelzaTheme('Light', 'Dark')).toEqual({
      colorScheme: 'light',
      overrides: ODELZA_LIGHT_THEME_OVERRIDES,
    });
  });

  it('selects Odelza Dark for Dark', () => {
    expect(resolveOdelzaTheme('Dark', 'Light')).toEqual({
      colorScheme: 'dark',
      overrides: ODELZA_DARK_THEME_OVERRIDES,
    });
  });

  it('continues to resolve System from the OS scheme', () => {
    expect(resolveOdelzaTheme('System', 'Light')).toEqual({
      colorScheme: 'light',
      overrides: ODELZA_LIGHT_THEME_OVERRIDES,
    });
    expect(resolveOdelzaTheme('System', 'Dark')).toEqual({
      colorScheme: 'dark',
      overrides: ODELZA_DARK_THEME_OVERRIDES,
    });
  });

  it.each([
    [
      ODELZA_LIGHT_THEME_OVERRIDES,
      {
        '--t-background-primary': '#ffffff',
        '--t-background-secondary': '#fffbf0',
        '--t-background-tertiary': '#fef6d8',
        '--t-background-quaternary': '#e4ddd2',
        '--t-gray-scale-gray3': '#fef6d8',
        '--t-font-color-primary': '#2d120d',
        '--t-font-color-secondary': '#5c463f',
        '--t-font-color-tertiary': '#7c6a62',
        '--t-font-color-light': '#928481',
        '--t-font-color-inverted': '#feefb8',
        '--t-border-color-strong': '#928481',
        '--t-border-color-medium': '#e4ddd2',
        '--t-border-color-light': '#fef6d8',
        '--t-accent-primary': '#6b0b0c',
        '--t-color-orange': '#9a4310',
        '--t-color-red': '#b3261e',
        '--t-color-green': '#1f6b3a',
        '--t-color-yellow': '#7a5200',
        '--t-snack-bar-success-color': '#1f6b3a',
        '--t-snack-bar-warning-color': '#7a5200',
      },
    ],
    [
      ODELZA_DARK_THEME_OVERRIDES,
      {
        '--t-background-primary': '#1a0c09',
        '--t-background-secondary': '#2d120d',
        '--t-background-tertiary': '#3a1b15',
        '--t-background-quaternary': '#47241c',
        '--t-gray-scale-gray3': '#3a1b15',
        '--t-font-color-primary': '#f6e9bf',
        '--t-font-color-secondary': '#cdb98f',
        '--t-font-color-tertiary': '#a39279',
        '--t-font-color-light': '#8f6f63',
        '--t-font-color-inverted': '#2d120d',
        '--t-border-color-strong': '#8f6f63',
        '--t-border-color-medium': '#47241c',
        '--t-border-color-light': '#3a1b15',
        '--t-accent-primary': '#cf3b30',
        '--t-color-orange': '#f2a065',
        '--t-color-red': '#ff9a90',
        '--t-color-green': '#7ed494',
        '--t-color-yellow': '#f2c14e',
        '--t-snack-bar-success-color': '#7ed494',
        '--t-snack-bar-warning-color': '#f2c14e',
      },
    ],
  ])(
    'maps representative semantic tokens to exact Odelza values',
    (theme, expected) => {
      expect(theme).toMatchObject(expected);
    },
  );

  it.each([
    [ODELZA_LIGHT_THEME_OVERRIDES, '#6b0b0c', '#861518', '#4d0809'],
    [ODELZA_DARK_THEME_OVERRIDES, '#cf3b30', '#c6392f', '#b6342b'],
  ])(
    'drives the blue action family from the primary with hover and pressed states',
    (theme, base, hover, pressed) => {
      expect(theme).toMatchObject({
        '--t-color-blue': base,
        '--t-color-blue8': base,
        '--t-color-blue10': hover,
        '--t-color-blue12': pressed,
        '--t-accent-accent10': hover,
        '--t-accent-accent12': pressed,
        '--t-border-color-blue': base,
        '--t-buttons-secondary-text-color': base,
      });
    },
  );

  it.each([
    [ODELZA_LIGHT_THEME_OVERRIDES, '#1d5f9e'],
    [ODELZA_DARK_THEME_OVERRIDES, '#8ebbef'],
  ])(
    'keeps blue tags and info states on the informational blue',
    (theme, informationalBlue) => {
      expect(theme).toMatchObject({
        '--t-tag-text-blue': informationalBlue,
        '--t-tag-text-sky': informationalBlue,
        '--t-color-sky': informationalBlue,
        '--t-snack-bar-info-color': informationalBlue,
      });
    },
  );

  it('exposes the same token keys in Light and Dark', () => {
    expect(Object.keys(ODELZA_LIGHT_THEME_OVERRIDES).sort()).toEqual(
      Object.keys(ODELZA_DARK_THEME_OVERRIDES).sort(),
    );
  });

  it('applies every override to the root and replaces the scheme cleanly', () => {
    const cleanupLight = applyOdelzaThemeToRoot(ODELZA_LIGHT_THEME_OVERRIDES);

    expect(
      document.documentElement.style.getPropertyValue('--t-color-blue'),
    ).toBe(ODELZA_LIGHT_THEME_OVERRIDES['--t-color-blue']);

    cleanupLight();
    const cleanupDark = applyOdelzaThemeToRoot(ODELZA_DARK_THEME_OVERRIDES);

    for (const [property, value] of Object.entries(
      ODELZA_DARK_THEME_OVERRIDES,
    )) {
      expect(document.documentElement.style.getPropertyValue(property)).toBe(
        String(value),
      );
    }

    cleanupDark();
  });

  it('restores pre-existing inline root values during cleanup', () => {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--t-color-blue', 'rebeccapurple', 'important');

    const cleanup = applyOdelzaThemeToRoot(ODELZA_LIGHT_THEME_OVERRIDES);
    cleanup();

    expect(rootStyle.getPropertyValue('--t-color-blue')).toBe('rebeccapurple');
    expect(rootStyle.getPropertyPriority('--t-color-blue')).toBe('important');
    rootStyle.removeProperty('--t-color-blue');
  });
});
