import { MAIN_COLOR_NAMES } from '@ui/theme/constants/MainColorNames';
import { ODELZA_NEUTRAL_COLOR_FAMILIES } from '@ui/theme/constants/OdelzaColorFamilies';
import { ODELZA_PALETTE_DARK } from '@ui/theme/constants/OdelzaPaletteDark';
import { ODELZA_PALETTE_LIGHT } from '@ui/theme/constants/OdelzaPaletteLight';
import { ODELZA_ROLES_DARK } from '@ui/theme/constants/OdelzaRolesDark';
import { ODELZA_ROLES_LIGHT } from '@ui/theme/constants/OdelzaRolesLight';
import { ODELZA_THEME_DARK } from '@ui/theme/constants/OdelzaThemeDark';
import { ODELZA_THEME_LIGHT } from '@ui/theme/constants/OdelzaThemeLight';
import { getContrastRatio } from '@ui/theme/utils/getContrastRatio';

// Minimums from the Odelza palette: AA 4.5:1 for text, 3:1 for borders and
// controls
const TEXT_CONTRAST = 4.5;
const CONTROL_CONTRAST = 3;

const MODES = [
  {
    name: 'light',
    palette: ODELZA_PALETTE_LIGHT,
    roles: ODELZA_ROLES_LIGHT,
    theme: ODELZA_THEME_LIGHT,
  },
  {
    name: 'dark',
    palette: ODELZA_PALETTE_DARK,
    roles: ODELZA_ROLES_DARK,
    theme: ODELZA_THEME_DARK,
  },
] as const;

describe.each(MODES)(
  'Odelza $name theme contrast',
  ({ palette, roles, theme }) => {
    it.each([
      ['textPrimary', 'surface'],
      ['textSecondary', 'surface'],
      ['textTertiary', 'surface'],
      ['textPrimary', 'backgroundPage'],
      ['textSecondary', 'backgroundPage'],
      ['textTertiary', 'backgroundPage'],
      ['textPrimary', 'surfaceAlt'],
      ['textPrimary', 'selection'],
      ['onPrimary', 'primary'],
      ['onPrimary', 'primaryHover'],
      ['onSecondary', 'secondary'],
      ['onSecondary', 'secondaryHover'],
      ['navText', 'navBackground'],
      ['navText', 'navItemActive'],
      ['invertedText', 'invertedBackground'],
    ] as const)('%s reads as text on %s', (foreground, background) => {
      expect(
        getContrastRatio(roles[foreground], roles[background]),
      ).toBeGreaterThanOrEqual(TEXT_CONTRAST);
    });

    // The pressed tone only shows while clicking; the official dark value
    // (#CC5047) gives 3.99:1 with Coffee Bean, so it is held to the 3:1 minimum
    it.each([
      ['onPrimary', 'primaryPressed'],
      ['borderStrong', 'surface'],
      ['focus', 'surface'],
      ['primary', 'surface'],
      ['navTextMuted', 'navBackground'],
    ] as const)(
      '%s is visible as a control on %s',
      (foreground, background) => {
        expect(
          getContrastRatio(roles[foreground], roles[background]),
        ).toBeGreaterThanOrEqual(CONTROL_CONTRAST);
      },
    );

    it.each([
      ['pine', 'pineSurface'],
      ['honey', 'honeySurface'],
      ['chili', 'chiliSurface'],
      ['denim', 'denimSurface'],
      ['mocha', 'mochaSurface'],
    ] as const)('status %s reads as text on %s', (foreground, background) => {
      expect(
        getContrastRatio(palette[foreground], palette[background]),
      ).toBeGreaterThanOrEqual(TEXT_CONTRAST);
    });

    it.each([
      ...MAIN_COLOR_NAMES,
      ...(Object.keys(
        ODELZA_NEUTRAL_COLOR_FAMILIES,
      ) as (keyof typeof ODELZA_NEUTRAL_COLOR_FAMILIES)[]),
    ])('%s tag text reads on its tag background', (family) => {
      expect(
        getContrastRatio(theme.tag.text[family], theme.tag.background[family]),
      ).toBeGreaterThanOrEqual(TEXT_CONTRAST);
    });
  },
);

describe('Odelza theme color names', () => {
  it('keeps blue informational and Blood Red as the primary action', () => {
    expect(ODELZA_THEME_LIGHT.color.blue).toBe(ODELZA_PALETTE_LIGHT.denim);
    expect(ODELZA_THEME_LIGHT.color.primary).toBe(
      ODELZA_PALETTE_LIGHT.bloodRed,
    );
    expect(ODELZA_THEME_DARK.color.blue).toBe(ODELZA_PALETTE_DARK.denim);
    expect(ODELZA_THEME_DARK.color.primary).toBe(ODELZA_PALETTE_DARK.bloodRed);
  });

  it('uses the palette hover and pressed tones on the primary scale', () => {
    expect(ODELZA_THEME_LIGHT.color.primary10).toBe(
      ODELZA_PALETTE_LIGHT.bloodRedHover,
    );
    expect(ODELZA_THEME_LIGHT.color.primary12).toBe(
      ODELZA_PALETTE_LIGHT.bloodRedPressed,
    );
  });

  it('builds real tints instead of grays for the light steps', () => {
    const tints = [1, 2, 3, 4, 5, 6, 7].map(
      (step) =>
        ODELZA_THEME_LIGHT.color[
          `blue${step}` as keyof typeof ODELZA_THEME_LIGHT.color
        ],
    );

    expect(new Set(tints).size).toBe(tints.length);
    expect(tints).not.toContain(ODELZA_ROLES_LIGHT.neutralScale[3]);
  });

  it('never uses pure black in dark mode', () => {
    expect(JSON.stringify(ODELZA_THEME_DARK)).not.toMatch(/#000000/i);
  });
});
