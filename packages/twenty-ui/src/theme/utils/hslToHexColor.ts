import { formatHexColor } from '@ui/theme/utils/formatHexColor';

// hue in degrees, saturation and lightness between 0 and 100
export const hslToHexColor = (
  hue: number,
  saturation: number,
  lightness: number,
) => {
  const normalizedSaturation = saturation / 100;
  const normalizedLightness = lightness / 100;
  const chroma =
    (1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation;
  const huePrime = (((hue % 360) + 360) % 360) / 60;
  const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));
  const [red, green, blue] =
    huePrime < 1
      ? [chroma, secondComponent, 0]
      : huePrime < 2
        ? [secondComponent, chroma, 0]
        : huePrime < 3
          ? [0, chroma, secondComponent]
          : huePrime < 4
            ? [0, secondComponent, chroma]
            : huePrime < 5
              ? [secondComponent, 0, chroma]
              : [chroma, 0, secondComponent];
  const lightnessMatch = normalizedLightness - chroma / 2;

  return formatHexColor({
    red: (red + lightnessMatch) * 255,
    green: (green + lightnessMatch) * 255,
    blue: (blue + lightnessMatch) * 255,
  });
};
