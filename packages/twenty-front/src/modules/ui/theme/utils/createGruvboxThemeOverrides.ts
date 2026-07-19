import { type ThemeOverrides } from 'twenty-ui/theme-constants';

type GruvboxPalette = {
  background: readonly [string, string, string, string];
  foreground: readonly [string, string, string, string, string];
  neutralRamp: readonly string[];
  accents: {
    red: string;
    green: string;
    yellow: string;
    blue: string;
    purple: string;
    aqua: string;
    orange: string;
  };
};

type GruvboxThemeConfig = {
  palette: GruvboxPalette;
  invertedBackground: string;
  invertedForeground: string;
  overlay: string;
  shadow: string;
};

const colorFamilyAliases = {
  red: 'red',
  ruby: 'red',
  crimson: 'red',
  tomato: 'orange',
  orange: 'orange',
  amber: 'yellow',
  yellow: 'yellow',
  lime: 'green',
  grass: 'green',
  green: 'green',
  jade: 'aqua',
  mint: 'aqua',
  turquoise: 'aqua',
  cyan: 'aqua',
  sky: 'blue',
  blue: 'blue',
  iris: 'purple',
  violet: 'purple',
  purple: 'purple',
  plum: 'purple',
  pink: 'purple',
  bronze: 'orange',
  gold: 'yellow',
  brown: 'orange',
} as const;

const neutralColorFamilies = [
  'gray',
  'mauve',
  'slate',
  'sage',
  'olive',
  'sand',
] as const;

const withAlpha = (color: string, alpha: string) => `${color}${alpha}`;

const createRamp = (
  palette: GruvboxPalette,
  accent: string,
): readonly string[] => [
  ...palette.neutralRamp.slice(0, 7),
  accent,
  accent,
  accent,
  accent,
  palette.foreground[0],
];

const addRamp = (
  overrides: ThemeOverrides,
  family: string,
  ramp: readonly string[],
) => {
  ramp.forEach((color, index) => {
    overrides[`--t-color-${family}${index + 1}`] = color;
  });
};

const addColorFamilies = (
  overrides: ThemeOverrides,
  palette: GruvboxPalette,
) => {
  for (const [family, accentName] of Object.entries(colorFamilyAliases)) {
    const accent = palette.accents[accentName];
    overrides[`--t-color-${family}`] = accent;
    overrides[`--t-tag-text-${family}`] = accent;
    overrides[`--t-tag-background-${family}`] = withAlpha(accent, '24');
    addRamp(overrides, family, createRamp(palette, accent));
  }

  for (const family of neutralColorFamilies) {
    overrides[`--t-color-${family}`] = palette.foreground[2];
    overrides[`--t-tag-text-${family}`] = palette.foreground[1];
    overrides[`--t-tag-background-${family}`] = palette.background[2];
    addRamp(overrides, family, palette.neutralRamp);
  }
};

export const createGruvboxThemeOverrides = ({
  palette,
  invertedBackground,
  invertedForeground,
  overlay,
  shadow,
}: GruvboxThemeConfig): ThemeOverrides => {
  const { accents, background, foreground, neutralRamp } = palette;
  const blueRamp = createRamp(palette, accents.blue);

  const overrides: ThemeOverrides = {
    '--t-buttons-secondary-text-color': accents.blue,
    '--t-accent-primary': accents.blue,
    '--t-accent-secondary': accents.blue,
    '--t-accent-tertiary': withAlpha(accents.blue, '33'),
    '--t-accent-quaternary': withAlpha(accents.blue, '1f'),
    '--t-accent-accent3570': accents.blue,
    '--t-accent-accent4060': accents.blue,
    '--t-background-primary': background[0],
    '--t-background-secondary': background[1],
    '--t-background-tertiary': background[2],
    '--t-background-quaternary': background[3],
    '--t-background-inverted-primary': invertedBackground,
    '--t-background-inverted-secondary': foreground[2],
    '--t-background-danger': withAlpha(accents.red, '24'),
    '--t-background-transparent-primary': withAlpha(background[0], 'cc'),
    '--t-background-transparent-secondary': withAlpha(background[1], 'b3'),
    '--t-background-transparent-strong': withAlpha(foreground[0], '29'),
    '--t-background-transparent-medium': withAlpha(foreground[0], '1f'),
    '--t-background-transparent-light': withAlpha(foreground[0], '14'),
    '--t-background-transparent-lighter': withAlpha(foreground[0], '0a'),
    '--t-background-transparent-danger': withAlpha(accents.red, '24'),
    '--t-background-transparent-blue': withAlpha(accents.blue, '24'),
    '--t-background-transparent-orange': withAlpha(accents.orange, '29'),
    '--t-background-transparent-success': withAlpha(accents.green, '24'),
    '--t-background-overlay-primary': withAlpha(overlay, 'b8'),
    '--t-background-overlay-secondary': withAlpha(overlay, '73'),
    '--t-background-overlay-tertiary': withAlpha(overlay, '3d'),
    '--t-background-primary-inverted': invertedBackground,
    '--t-background-primary-inverted-hover': foreground[2],
    '--t-border-color-strong': neutralRamp[6],
    '--t-border-color-medium': background[3],
    '--t-border-color-light': background[2],
    '--t-border-color-secondary-inverted': foreground[2],
    '--t-border-color-inverted': invertedBackground,
    '--t-border-color-danger': accents.red,
    '--t-border-color-blue': accents.blue,
    '--t-border-color-transparent-strong': withAlpha(foreground[0], '29'),
    '--t-box-shadow-color': withAlpha(shadow, '66'),
    '--t-font-color-primary': foreground[0],
    '--t-font-color-secondary': foreground[1],
    '--t-font-color-tertiary': foreground[2],
    '--t-font-color-light': foreground[3],
    '--t-font-color-extra-light': foreground[4],
    '--t-font-color-inverted': invertedForeground,
    '--t-font-color-danger': accents.red,
    '--t-snack-bar-success-color': accents.green,
    '--t-snack-bar-success-background-color': withAlpha(accents.green, '24'),
    '--t-snack-bar-error-color': accents.red,
    '--t-snack-bar-error-background-color': withAlpha(accents.red, '24'),
    '--t-snack-bar-warning-color': accents.yellow,
    '--t-snack-bar-warning-background-color': withAlpha(accents.yellow, '29'),
    '--t-snack-bar-info-color': accents.blue,
    '--t-snack-bar-info-background-color': withAlpha(accents.blue, '24'),
    '--t-snack-bar-default-color': foreground[0],
    '--t-snack-bar-default-background-color': background[2],
    '--t-code-text-gray': foreground[2],
    '--t-code-text-sky': accents.blue,
    '--t-code-text-pink': accents.purple,
    '--t-code-text-orange': accents.orange,
    '--t-code-text-green': accents.green,
    '--t--illustration-icon-color-blue': accents.blue,
    '--t--illustration-icon-color-gray': foreground[2],
    '--t--illustration-icon-fill-blue': withAlpha(accents.blue, '66'),
    '--t--illustration-icon-fill-gray': background[3],
  };

  blueRamp.forEach((color, index) => {
    overrides[`--t-accent-accent${index + 1}`] = color;
  });
  neutralRamp.forEach((color, index) => {
    overrides[`--t-gray-scale-gray${index + 1}`] = color;
  });
  addColorFamilies(overrides, palette);

  return overrides;
};
