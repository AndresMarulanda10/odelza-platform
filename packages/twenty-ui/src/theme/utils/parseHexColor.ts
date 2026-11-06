export type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

export const parseHexColor = (hexColor: string): RgbColor => {
  const normalized = hexColor.replace(/^#/, '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((channel) => channel + channel)
          .join('')
      : normalized.slice(0, 6);

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    throw new Error(`Invalid hex color: ${hexColor}`);
  }

  return {
    red: parseInt(expanded.slice(0, 2), 16),
    green: parseInt(expanded.slice(2, 4), 16),
    blue: parseInt(expanded.slice(4, 6), 16),
  };
};
