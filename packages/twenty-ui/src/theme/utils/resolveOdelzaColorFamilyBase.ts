import { type OdelzaColorFamilySource } from '@ui/theme/constants/OdelzaColorFamilies';
import { type OdelzaPalette } from '@ui/theme/types/OdelzaPalette';
import { getContrastRatio } from '@ui/theme/utils/getContrastRatio';
import { hslToHexColor } from '@ui/theme/utils/hslToHexColor';
import { mixHexColors } from '@ui/theme/utils/mixHexColors';

const MINIMUM_TEXT_CONTRAST = 4.6;
const TAG_BACKGROUND_WEIGHT = 0.12;

type ResolveOdelzaColorFamilyBaseArgs = {
  source: OdelzaColorFamilySource;
  palette: OdelzaPalette;
  surface: string;
  colorScheme: 'light' | 'dark';
};

// Derived families start from a lightness close to the palette colors and
// move away from the surface until the color reads as text (AA) both on the
// surface and on its own tag background.
export const resolveOdelzaColorFamilyBase = ({
  source,
  palette,
  surface,
  colorScheme,
}: ResolveOdelzaColorFamilyBaseArgs) => {
  if ('paletteColor' in source) {
    return palette[source.paletteColor];
  }

  const isLight = colorScheme === 'light';
  const step = isLight ? -1 : 1;
  let lightness = isLight ? 38 : 68;

  while (lightness > 5 && lightness < 95) {
    const candidate = hslToHexColor(source.hue, source.saturation, lightness);
    const tagBackground = mixHexColors(
      surface,
      candidate,
      TAG_BACKGROUND_WEIGHT,
    );

    if (
      getContrastRatio(candidate, surface) >= MINIMUM_TEXT_CONTRAST &&
      getContrastRatio(candidate, tagBackground) >= MINIMUM_TEXT_CONTRAST
    ) {
      return candidate;
    }

    lightness += step;
  }

  return hslToHexColor(source.hue, source.saturation, lightness);
};
