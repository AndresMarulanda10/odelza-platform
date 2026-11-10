import * as fs from 'fs';
import * as path from 'path';

import { BORDER_COMMON } from '@ui/theme/constants/BorderCommon';

import { buildOdelzaThemeFiles } from '../../../scripts/odelza-theme/buildOdelzaThemeFiles';

const THEME_CONSTANTS_DIRECTORY = path.resolve(__dirname, '..');
const DIST_DIRECTORY = path.resolve(__dirname, '../../../dist');
const CORNER_RADIUS_TOKENS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
const MAXED_RADIUS_TOKENS = ['pill', 'rounded'] as const;

// The formatter may rewrap long declarations, so compare token streams
const normalize = (content: string) =>
  content
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),:;{}[\]])\s*/g, '$1')
    .trim();

const readThemeFile = (fileName: string) =>
  fs.readFileSync(path.join(THEME_CONSTANTS_DIRECTORY, fileName), 'utf-8');

const extractSquircleBlock = (css: string) => {
  const match = css.match(
    /@supports \(corner-shape: squircle\) \{([\s\S]*?)\n\}/,
  );

  if (match === null) {
    throw new Error('Missing @supports (corner-shape: squircle) block');
  }

  return match[1];
};

const extractRadiusPx = (css: string, token: string) => {
  const match = css.match(
    new RegExp(`--odz-border-radius-${token}: (\\d+)px;`),
  );

  if (match === null) {
    throw new Error(`Missing --odz-border-radius-${token} declaration`);
  }

  return Number(match[1]);
};

describe('generated Odelza theme files', () => {
  const generatedFiles = buildOdelzaThemeFiles();

  it.each(Object.keys(generatedFiles))(
    'keeps %s in sync with the theme constants',
    (fileName) => {
      expect(normalize(readThemeFile(fileName))).toBe(
        normalize(generatedFiles[fileName as keyof typeof generatedFiles]),
      );
    },
  );

  it('does not declare any Twenty theme variable', () => {
    for (const fileName of Object.keys(generatedFiles)) {
      expect(readThemeFile(fileName)).not.toMatch(/--t-[a-z]/);
    }
  });
});

describe.each(['odelza-theme-light.css', 'odelza-theme-dark.css'])(
  'squircle corner overrides in %s',
  (fileName) => {
    const css = readThemeFile(fileName);
    const squircleBlock = extractSquircleBlock(css);
    const baseCss = css.replace(squircleBlock, '');

    it.each(CORNER_RADIUS_TOKENS)(
      'doubles the %s radius token for squircle corners',
      (token) => {
        expect(extractRadiusPx(squircleBlock, token)).toBe(
          extractRadiusPx(baseCss, token) * 2,
        );
      },
    );

    it.each(CORNER_RADIUS_TOKENS)(
      'keeps the base %s radius token aligned with BORDER_COMMON',
      (token) => {
        expect(`${extractRadiusPx(baseCss, token)}px`).toBe(
          BORDER_COMMON.radius[token],
        );
      },
    );

    it.each(MAXED_RADIUS_TOKENS)(
      'does not redefine the %s token, which is already at its geometric maximum',
      (token) => {
        expect(squircleBlock).not.toContain(`--odz-border-radius-${token}`);
      },
    );

    it('applies corner-shape universally with the --odz-corner-shape opt-out', () => {
      expect(squircleBlock).toContain(
        'corner-shape: var(--odz-corner-shape, squircle);',
      );
    });

    it('is mirrored into the committed dist copy', () => {
      expect(
        normalize(
          fs.readFileSync(path.join(DIST_DIRECTORY, fileName), 'utf-8'),
        ),
      ).toBe(normalize(css));
    });
  },
);
