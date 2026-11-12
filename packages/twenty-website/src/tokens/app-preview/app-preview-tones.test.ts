import { ODELZA_THEME_LIGHT, parseHexColor } from 'twenty-ui/theme';

import { APP_PREVIEW_TONES } from './app-preview-tones';

describe('app preview sidebar tone RGB', () => {
  it.each([
    ['amber', 'amber'],
    ['blue', 'blue'],
    ['gray', 'gray'],
    ['green', 'green'],
    ['orange', 'orange'],
    ['pink', 'pink'],
    ['purple', 'purple'],
    ['red', 'red'],
    ['teal', 'turquoise'],
    ['violet', 'violet'],
  ] as const)('converts the current %s icon ink to RGB', (tone, color) => {
    const { red, green, blue } = parseHexColor(
      ODELZA_THEME_LIGHT.color[`${color}11`],
    );

    expect(APP_PREVIEW_TONES.sidebarToneRgb(tone)).toBe(
      `${red}, ${green}, ${blue}`,
    );
  });

  it('uses the current gray icon ink for an unknown tone', () => {
    const { red, green, blue } = parseHexColor(ODELZA_THEME_LIGHT.color.gray11);

    expect(APP_PREVIEW_TONES.sidebarToneRgb('unknown-tone')).toBe(
      `${red}, ${green}, ${blue}`,
    );
  });
});
