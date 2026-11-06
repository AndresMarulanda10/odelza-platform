import { formatHexColor } from '@ui/theme/utils/formatHexColor';
import { parseHexColor } from '@ui/theme/utils/parseHexColor';
import { withHexAlpha } from '@ui/theme/utils/withHexAlpha';

type GetTranslucentColorForSurfaceArgs = {
  surface: string;
  background: string;
  alpha: number;
};

// Returns the color that, painted with this alpha over the background, gives
// the surface color. Used where a fill is drawn over content (progress bars)
// but must still look like the palette's opaque surface.
export const getTranslucentColorForSurface = ({
  surface,
  background,
  alpha,
}: GetTranslucentColorForSurfaceArgs) => {
  const target = parseHexColor(surface);
  const base = parseHexColor(background);
  const solve = (targetChannel: number, baseChannel: number) =>
    (targetChannel - (1 - alpha) * baseChannel) / alpha;

  return withHexAlpha(
    formatHexColor({
      red: solve(target.red, base.red),
      green: solve(target.green, base.green),
      blue: solve(target.blue, base.blue),
    }),
    alpha,
  );
};
