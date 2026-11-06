import { mixHexColors } from '@ui/theme/utils/mixHexColors';
import { withHexAlpha } from '@ui/theme/utils/withHexAlpha';

export type OdelzaColorScale = readonly string[];

type CreateOdelzaColorScaleArgs = {
  base: string;
  background: string;
  foreground: string;
  surface?: string;
  hover?: string;
  pressed?: string;
};

// Steps follow the 12-step convention the components expect: 1-2 subtle
// backgrounds, 3-5 component backgrounds, 6-8 borders, 9 solid, 10 solid
// hover, 11 text, 12 strong (pressed for actions). Steps 1-8 are real tints
// of the color over the surface, not grays.
const TINT_WEIGHTS = [0.03, 0.07, 0.12, 0.18, 0.25, 0.34, 0.46, 0.64];
const TRANSPARENT_ALPHAS = [
  0.03, 0.07, 0.12, 0.18, 0.25, 0.34, 0.46, 0.64, 0.9, 0.94, 0.97, 1,
];

export const createOdelzaColorScale = ({
  base,
  background,
  foreground,
  surface,
  hover,
  pressed,
}: CreateOdelzaColorScaleArgs): OdelzaColorScale => {
  const tints = TINT_WEIGHTS.map((weight) =>
    mixHexColors(background, base, weight),
  );

  if (surface !== undefined) {
    tints[2] = surface;
  }

  return [
    ...tints,
    base,
    hover ?? mixHexColors(base, foreground, 0.14),
    base,
    pressed ?? mixHexColors(base, foreground, 0.55),
  ];
};

export const createOdelzaTransparentColorScale = (
  base: string,
): OdelzaColorScale =>
  TRANSPARENT_ALPHAS.map((alpha) => withHexAlpha(base, alpha));
