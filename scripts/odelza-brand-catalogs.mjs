// Lingui derives message IDs from the text, so a rebranded message is extracted
// untranslated. This fills it from the translation of its Twenty version at a ref.
// Run from the repo root, after `lingui extract` and before `lingui compile`:
//   node scripts/odelza-brand-catalogs.mjs [--ref=HEAD] [--dry-run] <locales dir>...
import { execFileSync } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { formatter } from '@lingui/format-po';

const SOURCE_LOCALE = 'en';

// Sources reworded beyond the name swap. Each key is the Twenty text.
const SOURCE_REWRITES = [['contact Twenty team', 'contact the Odelza team']];

// Translations that inflect the name with a suffix, which a plain swap breaks.
const TRANSLATION_REWRITES = {
  'fi-FI': [
    [/\bTwentyyn\b/g, 'Odelzaan'],
    [/\bTwentyn\b/g, 'Odelzan'],
    [/\bTwentyä(?![a-zäöå])/g, 'Odelzaa'],
  ],
  'tr-TR': [
    [/\bTwenty'y?i\b/g, "Odelza'yı"],
    [/\bTwenty'y?e\b/g, "Odelza'ya"],
    [/\bTwenty'nin\b/g, "Odelza'nın"],
    [/\bTwenty'de\b/g, "Odelza'da"],
  ],
  'hu-HU': [
    [/\b([aA]) Twenty\b/g, '$1z Twenty'],
    [/\bTwenty-ben\b/g, 'Odelzában'],
    [/\bTwenty-t\b/g, 'Odelzát'],
  ],
  'fr-FR': [
    [/\b([dD])e Twenty\b/g, "$1'Odelza"],
    [/\b([qQ])ue Twenty\b/g, "$1u'Odelza"],
  ],
  'ca-ES': [
    [/\b([dD])e Twenty\b/g, "$1'Odelza"],
    [/\b([qQ])ue Twenty\b/g, "$1u'Odelza"],
  ],
};

const BRAND_PATTERN = /\bTwenty\b/;

const rebrandSource = (text) =>
  SOURCE_REWRITES.reduce(
    (result, [from, to]) => result.split(from).join(to),
    text,
  ).replace(/\bTwenty\b/g, 'Odelza');

const rebrandTranslation = (text, locale) =>
  (TRANSLATION_REWRITES[locale] ?? [])
    .reduce(
      (result, [pattern, replacement]) => result.replace(pattern, replacement),
      text,
    )
    .replace(/\bTwenty\b/g, 'Odelza');

const readCatalogAtRef = (ref, filePath) => {
  try {
    return execFileSync(
      'git',
      ['show', `${ref}:${filePath.split(path.sep).join('/')}`],
      {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      },
    );
  } catch {
    return null;
  }
};

const parseArguments = (argumentList) => {
  const options = { ref: 'HEAD', dryRun: false, directories: [] };

  for (const argument of argumentList) {
    if (argument === '--dry-run') {
      options.dryRun = true;
    } else if (argument.startsWith('--ref=')) {
      options.ref = argument.slice('--ref='.length);
    } else {
      options.directories.push(argument);
    }
  }

  return options;
};

const migrateCatalog = async ({
  filePath,
  locale,
  ref,
  dryRun,
  poFormatter,
}) => {
  const currentContent = await readFile(filePath, 'utf8');
  const previousContent = readCatalogAtRef(ref, filePath);

  if (previousContent === null) {
    return { filled: 0, warnings: [`${filePath}: not found at ${ref}`] };
  }

  const currentCatalog = poFormatter.parse(currentContent);
  const previousCatalog = poFormatter.parse(previousContent);

  const previousByRebrandedSource = new Map();

  for (const entry of Object.values(previousCatalog)) {
    if (BRAND_PATTERN.test(entry.message ?? '')) {
      previousByRebrandedSource.set(rebrandSource(entry.message), entry);
    }
  }

  let filled = 0;
  const warnings = [];

  for (const entry of Object.values(currentCatalog)) {
    const previousEntry = previousByRebrandedSource.get(entry.message);

    if (!previousEntry || entry.translation || !previousEntry.translation) {
      continue;
    }

    entry.translation =
      locale === SOURCE_LOCALE
        ? entry.message
        : rebrandTranslation(previousEntry.translation, locale);
    filled += 1;

    if (BRAND_PATTERN.test(entry.translation)) {
      warnings.push(`${locale}: still mentions Twenty: ${entry.translation}`);
    }

    if (dryRun) {
      console.log(
        `${locale}\n  - ${previousEntry.translation}\n  + ${entry.translation}`,
      );
    }
  }

  if (!dryRun && filled > 0) {
    await writeFile(
      filePath,
      poFormatter.serialize(currentCatalog, {
        locale,
        sourceLocale: SOURCE_LOCALE,
        existing: currentContent,
      }),
    );
  }

  return { filled, warnings };
};

const main = async () => {
  const { ref, dryRun, directories } = parseArguments(process.argv.slice(2));

  if (directories.length === 0) {
    console.error(
      'Usage: node scripts/odelza-brand-catalogs.mjs [--ref=HEAD] [--dry-run] <locales dir>...',
    );
    process.exit(1);
  }

  const poFormatter = formatter({ lineNumbers: false, printLinguiId: true });

  for (const directory of directories) {
    const fileNames = (await readdir(directory)).filter((fileName) =>
      fileName.endsWith('.po'),
    );
    let totalFilled = 0;

    for (const fileName of fileNames.sort()) {
      const { filled, warnings } = await migrateCatalog({
        filePath: path.join(directory, fileName),
        locale: path.basename(fileName, '.po'),
        ref,
        dryRun,
        poFormatter,
      });

      totalFilled += filled;
      warnings.forEach((warning) => console.warn(warning));
    }

    console.log(
      `${directory}: ${totalFilled} translations ${dryRun ? 'to fill' : 'filled'}`,
    );
  }
};

await main();
