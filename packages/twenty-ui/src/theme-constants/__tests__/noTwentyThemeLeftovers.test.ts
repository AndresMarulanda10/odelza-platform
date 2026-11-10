import * as fs from 'fs';
import * as path from 'path';

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
        .filter((filePath) => pattern.test(fs.readFileSync(filePath, 'utf-8')))
        .map((filePath) => path.relative(PACKAGES_DIRECTORY, filePath));

      expect(offendingFiles).toEqual([]);
    },
  );
});
