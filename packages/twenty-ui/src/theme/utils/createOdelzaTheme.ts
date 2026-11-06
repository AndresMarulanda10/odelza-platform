import { BORDER_COMMON } from '@ui/theme/constants/BorderCommon';
import { FONT_COMMON } from '@ui/theme/constants/FontCommon';
import {
  ODELZA_COLOR_FAMILIES,
  ODELZA_NEUTRAL_COLOR_FAMILIES,
} from '@ui/theme/constants/OdelzaColorFamilies';
import { THEME_COMMON } from '@ui/theme/constants/ThemeCommon';
import { type OdelzaPalette } from '@ui/theme/types/OdelzaPalette';
import { type OdelzaRoles } from '@ui/theme/types/OdelzaRoles';
import {
  createOdelzaColorScale,
  createOdelzaTransparentColorScale,
  type OdelzaColorScale,
} from '@ui/theme/utils/createOdelzaColorScale';
import { mixHexColors } from '@ui/theme/utils/mixHexColors';
import { getTranslucentColorForSurface } from '@ui/theme/utils/getTranslucentColorForSurface';
import { resolveOdelzaColorFamilyBase } from '@ui/theme/utils/resolveOdelzaColorFamilyBase';
import { withHexAlpha } from '@ui/theme/utils/withHexAlpha';

type MainColorFamily = keyof typeof ODELZA_COLOR_FAMILIES;
type NeutralColorFamily = keyof typeof ODELZA_NEUTRAL_COLOR_FAMILIES;
type ScaledColorFamily = MainColorFamily | NeutralColorFamily | 'primary';
type ScaleStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type ScaledColorKey = `${ScaledColorFamily}${ScaleStep}`;

type CreateOdelzaThemeArgs = {
  colorScheme: 'light' | 'dark';
  palette: OdelzaPalette;
  roles: OdelzaRoles;
};

const SCALE_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const getStep = (scale: OdelzaColorScale, step: ScaleStep) => scale[step - 1];

const flattenScales = (
  scales: Record<ScaledColorFamily, OdelzaColorScale>,
): Record<ScaledColorKey, string> => {
  const flattened: Partial<Record<ScaledColorKey, string>> = {};

  for (const [family, scale] of Object.entries(scales)) {
    for (const step of SCALE_STEPS) {
      flattened[`${family as ScaledColorFamily}${step}`] = getStep(scale, step);
    }
  }

  return flattened as Record<ScaledColorKey, string>;
};

export const createOdelzaTheme = ({
  colorScheme,
  palette,
  roles,
}: CreateOdelzaThemeArgs) => {
  const scaleBackground = roles.surface;
  const scaleForeground = roles.textPrimary;

  const createFamilyScale = (
    family: MainColorFamily | NeutralColorFamily,
  ): OdelzaColorScale => {
    const source =
      family in ODELZA_COLOR_FAMILIES
        ? ODELZA_COLOR_FAMILIES[family as MainColorFamily]
        : ODELZA_NEUTRAL_COLOR_FAMILIES[family as NeutralColorFamily];

    return createOdelzaColorScale({
      base: resolveOdelzaColorFamilyBase({
        source,
        palette,
        surface: scaleBackground,
        colorScheme,
      }),
      background: scaleBackground,
      foreground: scaleForeground,
      surface:
        'paletteSurface' in source ? palette[source.paletteSurface] : undefined,
    });
  };

  const familyNames = [
    ...Object.keys(ODELZA_COLOR_FAMILIES),
    ...Object.keys(ODELZA_NEUTRAL_COLOR_FAMILIES),
  ] as (MainColorFamily | NeutralColorFamily)[];

  const scales = Object.fromEntries([
    ...familyNames.map((family) => [family, createFamilyScale(family)]),
    [
      'primary',
      createOdelzaColorScale({
        base: roles.primary,
        background: scaleBackground,
        foreground: scaleForeground,
        hover: roles.primaryHover,
        pressed: roles.primaryPressed,
      }),
    ],
  ]) as Record<ScaledColorFamily, OdelzaColorScale>;

  const transparentScales = Object.fromEntries(
    Object.entries(scales).map(([family, scale]) => [
      family,
      createOdelzaTransparentColorScale(getStep(scale, 9)),
    ]),
  ) as Record<ScaledColorFamily, OdelzaColorScale>;

  const mainColors = Object.fromEntries(
    Object.keys(ODELZA_COLOR_FAMILIES).map((family) => [
      family,
      getStep(scales[family as MainColorFamily], 9),
    ]),
  ) as Record<MainColorFamily, string>;

  const tagFamilies = familyNames;
  const primary = scales.primary;
  const neutral = roles.neutralScale;
  const textAlpha = (alpha: number) => withHexAlpha(roles.textPrimary, alpha);
  const shadowAlpha = (alpha: number) => withHexAlpha(roles.shadow, alpha);
  const overlayAlpha = (alpha: number) => withHexAlpha(roles.overlay, alpha);
  const isLight = colorScheme === 'light';
  const statusFill = (surface: string) =>
    getTranslucentColorForSurface({
      surface,
      background: roles.surface,
      alpha: isLight ? 0.3 : 0.5,
    });

  return {
    ...THEME_COMMON,
    name: colorScheme,
    accent: {
      primary: getStep(primary, 5),
      secondary: getStep(primary, 5),
      tertiary: getStep(primary, 3),
      quaternary: getStep(primary, 2),
      accent3570: getStep(primary, 8),
      accent4060: getStep(primary, 8),
      ...Object.fromEntries(
        SCALE_STEPS.map((step) => [`accent${step}`, getStep(primary, step)]),
      ),
    } as {
      primary: string;
      secondary: string;
      tertiary: string;
      quaternary: string;
      accent3570: string;
      accent4060: string;
    } & Record<`accent${ScaleStep}`, string>,
    background: {
      noisy: roles.backgroundPage,
      primary: roles.surface,
      secondary: roles.backgroundPage,
      tertiary: roles.surfaceAlt,
      quaternary: roles.surfaceActive,
      elevated: roles.surfaceElevated,
      selection: roles.selection,
      invertedPrimary: roles.invertedBackground,
      invertedSecondary: roles.invertedBackgroundHover,
      danger: getStep(scales.red, 3),
      transparent: {
        primary: withHexAlpha(roles.surface, 0.72),
        secondary: withHexAlpha(roles.surface, 0.62),
        strong: textAlpha(0.16),
        medium: textAlpha(0.08),
        light: textAlpha(0.04),
        lighter: textAlpha(0.02),
        danger: withHexAlpha(getStep(scales.red, 9), 0.12),
        accent: withHexAlpha(roles.primary, 0.12),
        orange: withHexAlpha(getStep(scales.orange, 9), 0.14),
        success: withHexAlpha(getStep(scales.green, 9), 0.12),
      },
      overlayPrimary: overlayAlpha(0.72),
      overlaySecondary: overlayAlpha(0.36),
      overlayTertiary: overlayAlpha(0.07),
      radialGradient: `radial-gradient(50% 62.62% at 50% 0%, ${neutral[8]} 0%, ${neutral[9]} 100%)`,
      radialGradientHover: `radial-gradient(76.32% 95.59% at 50% 0%, ${neutral[9]} 0%, ${neutral[10]} 100%)`,
      primaryInverted: roles.invertedBackground,
      primaryInvertedHover: roles.invertedBackgroundHover,
    },
    blur: {
      light: `blur(6px) saturate(200%) contrast(${isLight ? 50 : 100}%) brightness(130%)`,
      medium: `blur(12px) saturate(200%) contrast(${isLight ? 50 : 100}%) brightness(130%)`,
      strong: `blur(20px) saturate(200%) contrast(${isLight ? 50 : 100}%) brightness(130%)`,
    },
    border: {
      color: {
        // Components use "strong" as a decorative mid border; the palette's
        // strong border (3:1) is exposed as "control" for fields and controls
        strong: roles.borderMedium,
        control: roles.borderStrong,
        medium: roles.borderSubtle,
        light: roles.borderLight,
        secondaryInverted: roles.invertedBackgroundHover,
        inverted: roles.invertedBackground,
        danger: getStep(scales.red, 5),
        accent: getStep(primary, 7),
        focus: roles.focus,
        transparentStrong: textAlpha(0.08),
      },
      ...BORDER_COMMON,
    },
    boxShadow: isLight
      ? {
          color: shadowAlpha(0.04),
          light: `0px 2px 4px 0px ${shadowAlpha(0.04)}, 0px 0px 4px 0px ${shadowAlpha(0.08)}`,
          strong: `2px 4px 16px 0px ${shadowAlpha(0.16)}, 0px 2px 4px 0px ${shadowAlpha(0.08)}`,
          underline: `0px 1px 0px 0px ${shadowAlpha(0.36)}`,
          superHeavy: `0px 0px 8px 0px ${shadowAlpha(0.16)}, 0px 8px 64px -16px ${shadowAlpha(0.48)}, 0px 24px 56px -16px ${shadowAlpha(0.08)}`,
        }
      : {
          color: shadowAlpha(0.6),
          light: `0px 2px 4px 0px ${shadowAlpha(0.04)}, 0px 0px 4px 0px ${shadowAlpha(0.08)}`,
          strong: `2px 4px 16px 0px ${shadowAlpha(0.16)}, 0px 2px 4px 0px ${shadowAlpha(0.08)}`,
          underline: `0px 1px 0px 0px ${shadowAlpha(0.32)}`,
          superHeavy: `2px 4px 16px 0px ${shadowAlpha(0.12)}, 0px 2px 4px 0px ${shadowAlpha(0.04)}`,
        },
    font: {
      color: {
        primary: roles.textPrimary,
        secondary: roles.textSecondary,
        tertiary: roles.textTertiary,
        light: roles.textPlaceholder,
        extraLight: roles.textDisabled,
        inverted: roles.invertedText,
        danger: getStep(scales.red, 11),
        link: roles.focus,
      },
      ...FONT_COMMON,
    },
    buttons: {
      onPrimary: roles.onPrimary,
      secondaryBackground: roles.secondary,
      secondaryBackgroundHover: roles.secondaryHover,
      secondaryBackgroundPressed: roles.secondaryPressed,
      onSecondary: roles.onSecondary,
      onPrimaryMuted: mixHexColors(roles.onPrimary, roles.primary, 0.35),
    },
    navigation: {
      background: roles.navBackground,
      text: roles.navText,
      textMuted: roles.navTextMuted,
      itemHover: roles.navItemHover,
      itemActive: roles.navItemActive,
    },
    // The snackbar progress bar is drawn over the message, so its fill is
    // translucent; over the surface it gives the palette status surface
    snackBar: {
      success: {
        color: palette.pine,
        backgroundColor: statusFill(palette.pineSurface),
      },
      error: {
        color: palette.chili,
        backgroundColor: statusFill(palette.chiliSurface),
      },
      warning: {
        color: palette.honey,
        backgroundColor: statusFill(palette.honeySurface),
      },
      info: {
        color: palette.denim,
        backgroundColor: statusFill(palette.denimSurface),
      },
      default: {
        color: roles.textPrimary,
        backgroundColor: statusFill(palette.mochaSurface),
      },
    },
    tag: {
      text: Object.fromEntries(
        tagFamilies.map((family) => [family, getStep(scales[family], 11)]),
      ) as Record<MainColorFamily | NeutralColorFamily, string>,
      background: Object.fromEntries(
        tagFamilies.map((family) => [family, getStep(scales[family], 3)]),
      ) as Record<MainColorFamily | NeutralColorFamily, string>,
    },
    code: {
      text: {
        gray: roles.textTertiary,
        sky: getStep(scales.sky, 11),
        pink: getStep(scales.pink, 11),
        orange: getStep(scales.orange, 11),
        green: getStep(scales.green, 11),
      },
      font: { family: 'DM Mono' },
    },
    illustrationIcon: {
      color: {
        blue: getStep(scales.blue, 9),
        gray: neutral[8],
      },
      fill: {
        blue: getStep(scales.blue, 5),
        gray: neutral[4],
      },
    },
    grayScale: Object.fromEntries(
      SCALE_STEPS.map((step) => [`gray${step}`, neutral[step - 1]]),
    ) as Record<`gray${ScaleStep}`, string>,
    color: {
      ...mainColors,
      primary: roles.primary,
      ...flattenScales(scales),
      transparent: flattenScales(transparentScales),
    },
  };
};

export type OdelzaTheme = ReturnType<typeof createOdelzaTheme>;
