import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const PACKAGES_DIRECTORY = path.resolve(__dirname, '../../../..');
const SCANNED_DIRECTORIES = [
  'twenty-ui/src',
  'twenty-ui/.storybook',
  'twenty-front/src',
  'twenty-front/.storybook',
  'twenty-emails/src',
  'twenty-apps',
  'twenty-front-component-renderer/src',
];
const SCANNED_EXTENSIONS = ['.ts', '.tsx', '.scss', '.css'];
const SKIPPED_DIRECTORIES = new Set(['node_modules', 'dist', 'locales']);
const FORBIDDEN_PATTERNS = [
  { name: 'Twenty CSS variable', pattern: /--t-[a-z]/ },
  { name: 'Twenty theme accessor', pattern: /\bthemeCssVariables\b/ },
  { name: 'Radix color import', pattern: /@radix-ui\/colors/ },
];

const listSourceFiles = (directory: string): string[] => {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return SKIPPED_DIRECTORIES.has(entry.name)
        ? []
        : listSourceFiles(entryPath);
    }

    return SCANNED_EXTENSIONS.includes(path.extname(entry.name))
      ? [entryPath]
      : [];
  });
};

const hasLegacyAccessor = (source: string, external: boolean): boolean => {
  if (!external || !/\bthemeCssVariables\b/.test(source)) {
    return /\bthemeCssVariables\b/.test(source);
  }

  // Only the verified npm named-import binding is compatible, never a whole file.
  const file = ts.createSourceFile(
    'fixture.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  const host = ts.createCompilerHost({ noLib: true, noResolve: true });
  host.getSourceFile = (name) => (name === file.fileName ? file : undefined);
  const checker = ts
    .createProgram([file.fileName], { noLib: true, noResolve: true }, host)
    .getTypeChecker();
  const compatibleSymbols = new Set<ts.Symbol>();
  const allowedPositions = new Set<number>();

  for (const statement of file.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== 'twenty-ui/theme-constants'
    ) {
      continue;
    }
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      if ((element.propertyName ?? element.name).text !== 'themeCssVariables')
        continue;
      const symbol = checker.getSymbolAtLocation(element.name);
      // Invalid duplicate declarations can share an import symbol; fail closed.
      if (!symbol?.declarations?.every(ts.isImportSpecifier)) continue;
      compatibleSymbols.add(symbol);
      if (element.propertyName)
        allowedPositions.add(element.propertyName.getStart(file));
    }
  }

  const visit = (node: ts.Node) => {
    if (ts.isIdentifier(node) && node.text === 'themeCssVariables') {
      const symbol = checker.getSymbolAtLocation(node);
      if (symbol && compatibleSymbols.has(symbol))
        allowedPositions.add(node.getStart(file));
    }
    ts.forEachChild(node, visit);
  };
  visit(file);

  return [...source.matchAll(/\bthemeCssVariables\b/g)].some(
    (match) => !allowedPositions.has(match.index),
  );
};

const isPublishedThemeConsumer = (filePath: string): boolean =>
  ['call-recorder', 'twenty-fireflies'].some((app) => {
    const directory = path.join(PACKAGES_DIRECTORY, 'twenty-apps/public', app);
    if (!filePath.startsWith(`${directory}${path.sep}`)) return false;
    const manifest = JSON.parse(
      fs.readFileSync(path.join(directory, 'package.json'), 'utf-8'),
    );
    return manifest.devDependencies?.['twenty-ui'] === '^1.0.0-alpha.1';
  });

describe('published theme accessor compatibility', () => {
  const imported =
    "import { themeCssVariables } from 'twenty-ui/theme-constants';";

  it('preserves the published named import and its bound references', () => {
    expect(
      hasLegacyAccessor(
        `${imported} const color = themeCssVariables.font;`,
        true,
      ),
    ).toBe(false);
    expect(
      hasLegacyAccessor(
        "import { themeCssVariables as publishedTheme } from 'twenty-ui/theme-constants'; const color = publishedTheme.font;",
        true,
      ),
    ).toBe(false);
  });

  it.each([
    'const themeCssVariables = {};',
    `${imported} function local(themeCssVariables) { return themeCssVariables; }`,
    `${imported} const local = { themeCssVariables: {} };`,
    `${imported} const themeCssVariables = {};`,
    `${imported} const local = () => { const themeCssVariables = {}; return themeCssVariables; };`,
    `${imported} const text = 'themeCssVariables';`,
    "import { themeCssVariables } from 'another-package';",
    "import themeCssVariables from 'twenty-ui/theme-constants';",
    "import * as themeCssVariables from 'twenty-ui/theme-constants';",
    "export { themeCssVariables } from 'twenty-ui/theme-constants';",
  ])('rejects owned declarations and unsupported imports: %s', (source) => {
    expect(hasLegacyAccessor(source, true)).toBe(true);
  });

  it('does not exempt workspace consumers', () => {
    expect(hasLegacyAccessor(imported, false)).toBe(true);
  });

  it('keeps raw legacy CSS forbidden beside a compatible import', () => {
    expect(
      FORBIDDEN_PATTERNS[0].pattern.test(`${imported} 'var(--t-spacing-2)'`),
    ).toBe(true);
  });

  it.each(['light', 'dark'])(
    'defines both inline maps in the %s theme',
    (scheme) => {
      const css = fs.readFileSync(
        path.join(
          PACKAGES_DIRECTORY,
          `twenty-ui/src/theme-constants/odelza-theme-${scheme}.css`,
        ),
        'utf-8',
      );
      const definitions = new Set(
        [...css.matchAll(/(--odz-[\w-]+)\s*:/g)].map((match) => match[1]),
      );
      for (const relativePath of [
        'twenty-apps/examples/document-generator/src/front-components/generate-document-form.front-component.tsx',
        'twenty-apps/public/twenty-slack/src/components/send-message-form.front-component.tsx',
      ]) {
        const source = fs.readFileSync(
          path.join(PACKAGES_DIRECTORY, relativePath),
          'utf-8',
        );
        const tokens = [...source.matchAll(/var\((--[\w-]+)\)/g)].map(
          (match) => match[1],
        );
        expect(tokens.length).toBeGreaterThan(20);
        expect(tokens.filter((token) => !definitions.has(token))).toEqual([]);
      }
    },
  );
});

describe('Odelza theme guard', () => {
  const sourceFiles = SCANNED_DIRECTORIES.flatMap((directory) =>
    listSourceFiles(path.join(PACKAGES_DIRECTORY, directory)),
  ).filter((filePath) => filePath !== __filename);

  it('scans the UI sources', () => {
    expect(sourceFiles.length).toBeGreaterThan(1000);
  });

  it.each(FORBIDDEN_PATTERNS)(
    'finds no $name in the UI sources',
    ({ pattern }) => {
      const offendingFiles = sourceFiles
        .filter((filePath) => {
          const source = fs.readFileSync(filePath, 'utf-8');
          return pattern.source === /\bthemeCssVariables\b/.source
            ? hasLegacyAccessor(source, isPublishedThemeConsumer(filePath))
            : pattern.test(source);
        })
        .map((filePath) => path.relative(PACKAGES_DIRECTORY, filePath));

      expect(offendingFiles).toEqual([]);
    },
  );
});
