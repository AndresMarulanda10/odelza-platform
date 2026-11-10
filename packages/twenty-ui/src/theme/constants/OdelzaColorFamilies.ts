import { type OdelzaPalette } from '@ui/theme/types/OdelzaPalette';

export type OdelzaColorFamilySource =
  | {
      paletteColor: keyof OdelzaPalette;
      paletteSurface?: keyof OdelzaPalette;
    }
  | { hue: number; saturation: number };

// Data color families. Their keys are stored in workspace data (select
// options, tags, views), so they must keep these names. Families tied to a
// palette color use it as-is; the rest are derived in the same earthy style
// with their own hue so every name keeps showing the color it says.
// The order is the order of the color pickers and of automatic chart colors.
export const ODELZA_COLOR_FAMILIES = {
  red: { paletteColor: 'chili', paletteSurface: 'chiliSurface' },
  ruby: { hue: 350, saturation: 58 },
  crimson: { hue: 336, saturation: 52 },
  tomato: { hue: 10, saturation: 66 },
  orange: { paletteColor: 'cinnamon' },
  amber: { hue: 34, saturation: 82 },
  yellow: { paletteColor: 'honey', paletteSurface: 'honeySurface' },
  lime: { hue: 78, saturation: 52 },
  grass: { hue: 118, saturation: 38 },
  green: { paletteColor: 'pine', paletteSurface: 'pineSurface' },
  jade: { hue: 152, saturation: 46 },
  mint: { hue: 166, saturation: 52 },
  turquoise: { paletteColor: 'eucalyptus' },
  cyan: { hue: 188, saturation: 60 },
  sky: { hue: 200, saturation: 64 },
  blue: { paletteColor: 'denim', paletteSurface: 'denimSurface' },
  iris: { hue: 236, saturation: 44 },
  violet: { hue: 258, saturation: 40 },
  purple: { paletteColor: 'mulberry' },
  plum: { hue: 296, saturation: 34 },
  pink: { hue: 324, saturation: 46 },
  bronze: { hue: 18, saturation: 30 },
  gold: { hue: 42, saturation: 40 },
  brown: { hue: 22, saturation: 40 },
  gray: { paletteColor: 'mocha', paletteSurface: 'mochaSurface' },
} as const satisfies Record<string, OdelzaColorFamilySource>;

// Tinted neutrals that only exist as 12-step scales (tags and secondary
// colors), not as selectable main colors.
export const ODELZA_NEUTRAL_COLOR_FAMILIES = {
  mauve: { hue: 300, saturation: 8 },
  slate: { hue: 215, saturation: 10 },
  sage: { hue: 150, saturation: 8 },
  olive: { hue: 80, saturation: 9 },
  sand: { hue: 38, saturation: 14 },
} as const satisfies Record<string, OdelzaColorFamilySource>;
