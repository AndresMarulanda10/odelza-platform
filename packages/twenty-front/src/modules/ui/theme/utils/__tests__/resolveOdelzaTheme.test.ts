/* oxlint-disable twenty/no-hardcoded-colors -- Exact palette values are the contract under test. */
import { GRUVBOX_DARK_THEME_OVERRIDES } from '@/ui/theme/constants/gruvboxDarkThemeOverrides';
import { GRUVBOX_LIGHT_THEME_OVERRIDES } from '@/ui/theme/constants/gruvboxLightThemeOverrides';
import {
  applyOdelzaThemeToRoot,
  resolveOdelzaTheme,
} from '@/ui/theme/utils/resolveOdelzaTheme';

describe('resolveOdelzaTheme', () => {
  it('selects Gruvbox Light for Light', () => {
    expect(resolveOdelzaTheme('Light', 'Dark')).toEqual({
      colorScheme: 'light',
      overrides: GRUVBOX_LIGHT_THEME_OVERRIDES,
    });
  });

  it('selects Gruvbox Dark for Dark', () => {
    expect(resolveOdelzaTheme('Dark', 'Light')).toEqual({
      colorScheme: 'dark',
      overrides: GRUVBOX_DARK_THEME_OVERRIDES,
    });
  });

  it('continues to resolve System from the OS scheme', () => {
    expect(resolveOdelzaTheme('System', 'Light')).toEqual({
      colorScheme: 'light',
      overrides: GRUVBOX_LIGHT_THEME_OVERRIDES,
    });
    expect(resolveOdelzaTheme('System', 'Dark')).toEqual({
      colorScheme: 'dark',
      overrides: GRUVBOX_DARK_THEME_OVERRIDES,
    });
  });

  it.each([
    [
      GRUVBOX_LIGHT_THEME_OVERRIDES,
      {
        '--t-background-primary': '#f9f5d7',
        '--t-background-secondary': '#fbf1c7',
        '--t-background-tertiary': '#f2e5bc',
        '--t-background-quaternary': '#ebdbb2',
        '--t-font-color-primary': '#282828',
        '--t-font-color-secondary': '#3c3836',
        '--t-font-color-tertiary': '#504945',
        '--t-font-color-light': '#665c54',
        '--t-font-color-inverted': '#fbf1c7',
        '--t-border-color-strong': '#a89984',
        '--t-border-color-medium': '#ebdbb2',
        '--t-border-color-light': '#f2e5bc',
        '--t-accent-primary': '#076678',
        '--t-accent-accent10': '#076678',
        '--t-color-blue': '#076678',
        '--t-color-orange': '#af3a03',
        '--t-color-red': '#9d0006',
        '--t-color-green': '#79740e',
        '--t-color-yellow': '#b57614',
        '--t-snack-bar-success-color': '#79740e',
        '--t-snack-bar-warning-color': '#b57614',
      },
    ],
    [
      GRUVBOX_DARK_THEME_OVERRIDES,
      {
        '--t-background-primary': '#1d2021',
        '--t-background-secondary': '#282828',
        '--t-background-tertiary': '#32302f',
        '--t-background-quaternary': '#3c3836',
        '--t-font-color-primary': '#fbf1c7',
        '--t-font-color-secondary': '#ebdbb2',
        '--t-font-color-tertiary': '#d5c4a1',
        '--t-font-color-light': '#bdae93',
        '--t-font-color-inverted': '#1d2021',
        '--t-border-color-strong': '#7c6f64',
        '--t-border-color-medium': '#3c3836',
        '--t-border-color-light': '#32302f',
        '--t-accent-primary': '#83a598',
        '--t-accent-accent10': '#83a598',
        '--t-color-blue': '#83a598',
        '--t-color-orange': '#fe8019',
        '--t-color-red': '#fb4934',
        '--t-color-green': '#b8bb26',
        '--t-color-yellow': '#fabd2f',
        '--t-snack-bar-success-color': '#b8bb26',
        '--t-snack-bar-warning-color': '#fabd2f',
      },
    ],
  ])(
    'maps representative semantic tokens to exact Gruvbox values',
    (theme, expected) => {
      expect(theme).toMatchObject(expected);
    },
  );

  it('exposes the same token keys in Light and Dark', () => {
    expect(Object.keys(GRUVBOX_LIGHT_THEME_OVERRIDES).sort()).toEqual(
      Object.keys(GRUVBOX_DARK_THEME_OVERRIDES).sort(),
    );
  });

  it('applies every override to the root and replaces the scheme cleanly', () => {
    const cleanupLight = applyOdelzaThemeToRoot(GRUVBOX_LIGHT_THEME_OVERRIDES);

    expect(
      document.documentElement.style.getPropertyValue('--t-color-blue'),
    ).toBe(GRUVBOX_LIGHT_THEME_OVERRIDES['--t-color-blue']);

    cleanupLight();
    const cleanupDark = applyOdelzaThemeToRoot(GRUVBOX_DARK_THEME_OVERRIDES);

    for (const [property, value] of Object.entries(
      GRUVBOX_DARK_THEME_OVERRIDES,
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

    const cleanup = applyOdelzaThemeToRoot(GRUVBOX_LIGHT_THEME_OVERRIDES);
    cleanup();

    expect(rootStyle.getPropertyValue('--t-color-blue')).toBe('rebeccapurple');
    expect(rootStyle.getPropertyPriority('--t-color-blue')).toBe('important');
    rootStyle.removeProperty('--t-color-blue');
  });
});
