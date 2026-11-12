import { BORDER_COMMON } from '../../src/theme/constants/BorderCommon';
import { ODELZA_THEME_DARK } from '../../src/theme/constants/OdelzaThemeDark';
import { ODELZA_THEME_LIGHT } from '../../src/theme/constants/OdelzaThemeLight';

export const ODELZA_CSS_VARIABLE_PREFIX = '--odz';

const SPACING_STEPS = 33;
const HALF_SPACING_STEPS = [0.5, 1.5];
const SQUIRCLE_RADIUS_TOKENS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
const MAX_LINE_LENGTH = 80;

type ThemeTree = { [key: string]: ThemeTree | string | number };

// Half spacing steps such as 0.5 become --odz-spacing-0_5
const toKebabCase = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/\./g, '_')
    .toLowerCase();

// spacing is a function in the theme; the CSS exposes its first 33 steps and
// the half steps the components use
const toSerializableTheme = (theme: object): ThemeTree => {
  const tree: ThemeTree = {};

  for (const [key, value] of Object.entries(theme)) {
    if (typeof value === 'function') {
      if (key !== 'spacing') {
        throw new Error(`Unexpected function in theme at ${key}`);
      }
      const spacing = value as (...args: number[]) => string;
      const steps = [
        ...Array.from({ length: SPACING_STEPS }, (_, index) => index),
        ...HALF_SPACING_STEPS,
      ];

      tree[key] = Object.fromEntries(
        steps.map((step) => [String(step), spacing(step)]),
      );
    } else if (typeof value === 'object' && value !== null) {
      tree[key] = toSerializableTheme(value);
    } else {
      tree[key] = value as string | number;
    }
  }

  return tree;
};

const flattenTheme = (
  tree: ThemeTree,
  variablePrefix: string,
  declarations: Map<string, string>,
) => {
  for (const [key, value] of Object.entries(tree)) {
    const variableName = `${variablePrefix}-${toKebabCase(key)}`;

    if (typeof value === 'object') {
      flattenTheme(value, variableName, declarations);
    } else {
      declarations.set(variableName, String(value));
    }
  }

  return declarations;
};

const assertSameShape = (light: ThemeTree, dark: ThemeTree, path = '') => {
  const lightKeys = Object.keys(light).sort().join(',');
  const darkKeys = Object.keys(dark).sort().join(',');

  if (lightKeys !== darkKeys) {
    throw new Error(`Light and dark themes differ at "${path || 'root'}"`);
  }

  for (const key of Object.keys(light)) {
    const lightValue = light[key];
    const darkValue = dark[key];

    if (typeof lightValue === 'object' && typeof darkValue === 'object') {
      assertSameShape(lightValue, darkValue, `${path}.${key}`);
    } else if (
      typeof lightValue === 'object' ||
      typeof darkValue === 'object'
    ) {
      throw new Error(`Light and dark themes differ at "${path}.${key}"`);
    }
  }
};

const buildSquircleBlock = (className: string) => {
  const radiusDeclarations = SQUIRCLE_RADIUS_TOKENS.map((token) => {
    const baseRadius = Number.parseInt(BORDER_COMMON.radius[token], 10);

    return `    ${ODELZA_CSS_VARIABLE_PREFIX}-border-radius-${token}: ${baseRadius * 2}px;`;
  }).join('\n');

  return `/* Squircle corners: progressive enhancement for browsers supporting
   corner-shape (Chromium 139+). A squircle needs ~2x the radius of a round
   corner to read as the same visual size, so the radius tokens are doubled
   here; other browsers keep the base tokens as plain rounded corners.

   Shape rules:
   - pill, rounded and the *-round tokens are never doubled: they belong to
     elements that keep corner-shape: round (circles, capsules, checkboxes,
     chips, tags) and must look identical in both modes.
   - Opt a subtree out of squircles with ${ODELZA_CSS_VARIABLE_PREFIX}-corner-shape: round, or a
     single element with corner-shape: round.
   - Nested radii must stay concentric in both modes: derive them from the
     parent radius token minus the inset, e.g.
     calc(var(${ODELZA_CSS_VARIABLE_PREFIX}-border-radius-md) - var(${ODELZA_CSS_VARIABLE_PREFIX}-spacing-1)).
     The token doubles under squircle while the inset does not, which is
     exactly what concentricity requires. */
@supports (corner-shape: squircle) {
  .${className} {
${radiusDeclarations}
  }

  /* Zero specificity on purpose: any component rule can override it. */
  *,
  *::before,
  *::after {
    corner-shape: var(${ODELZA_CSS_VARIABLE_PREFIX}-corner-shape, squircle);
  }
}
`;
};

// Match complete CSS hex-color tokens without changing other serialized text.
const normalizeCssHexColors = (value: string) =>
  value.replace(
    /(?<![\w#-])#(?:[\da-fA-F]{8}|[\da-fA-F]{6}|[\da-fA-F]{4}|[\da-fA-F]{3})(?![\w-])/g,
    (color) => color.toLowerCase(),
  );

const buildThemeCss = (tree: ThemeTree, className: 'light' | 'dark') => {
  const declarations = flattenTheme(
    tree,
    ODELZA_CSS_VARIABLE_PREFIX,
    new Map(),
  );
  const body = [...declarations.entries()]
    .map(([name, value]) => `  ${name}: ${normalizeCssHexColors(value)};`)
    .join('\n');

  return `/* Odelza ${className} theme. Generated by scripts/odelza-theme/generateOdelzaTheme.ts
   from src/theme/constants/OdelzaTheme${className === 'light' ? 'Light' : 'Dark'}.ts. Do not edit by hand. */

.${className} {
${body}
}

${buildSquircleBlock(className)}`;
};

const formatObjectKey = (key: string) =>
  /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `'${key}'`;

const buildAccessorLines = (
  tree: ThemeTree,
  variablePrefix: string,
  indentLevel: number,
): string[] => {
  const indent = '  '.repeat(indentLevel);
  const lines: string[] = [];

  for (const [key, value] of Object.entries(tree)) {
    const variableName = `${variablePrefix}-${toKebabCase(key)}`;
    const objectKey = formatObjectKey(key);

    if (typeof value === 'object') {
      lines.push(`${indent}${objectKey}: {`);
      lines.push(...buildAccessorLines(value, variableName, indentLevel + 1));
      lines.push(`${indent}},`);
    } else {
      const singleLine = `${indent}${objectKey}: 'var(${variableName})',`;

      if (singleLine.length <= MAX_LINE_LENGTH) {
        lines.push(singleLine);
      } else {
        lines.push(`${indent}${objectKey}:`);
        lines.push(`${indent}  'var(${variableName})',`);
      }
    }
  }

  return lines;
};

const buildAccessorTs = (tree: ThemeTree) =>
  [
    '// Odelza theme CSS variables accessor. Generated by',
    '// scripts/odelza-theme/generateOdelzaTheme.ts. Do not edit by hand.',
    'export const odelzaThemeCssVariables = {',
    ...buildAccessorLines(tree, ODELZA_CSS_VARIABLE_PREFIX, 1),
    '};',
    '',
  ].join('\n');

export const buildOdelzaThemeFiles = () => {
  const light = toSerializableTheme(ODELZA_THEME_LIGHT);
  const dark = toSerializableTheme(ODELZA_THEME_DARK);

  assertSameShape(light, dark);

  return {
    'odelza-theme-light.css': buildThemeCss(light, 'light'),
    'odelza-theme-dark.css': buildThemeCss(dark, 'dark'),
    'odelzaThemeCssVariables.ts': buildAccessorTs(light),
  };
};
