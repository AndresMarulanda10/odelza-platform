import * as fs from 'fs';
import * as path from 'path';

import { buildOdelzaThemeFiles } from './buildOdelzaThemeFiles';

// Writes the Odelza theme CSS files and the typed accessor from the theme
// constants. Run it from the repository root after changing anything under
// src/theme/constants:
// npx tsx --tsconfig packages/twenty-ui/tsconfig.json packages/twenty-ui/scripts/odelza-theme/generateOdelzaTheme.ts
const THEME_CONSTANTS_DIRECTORY = path.resolve(
  'packages/twenty-ui/src/theme-constants',
);

for (const [fileName, content] of Object.entries(buildOdelzaThemeFiles())) {
  fs.writeFileSync(path.join(THEME_CONSTANTS_DIRECTORY, fileName), content);
  process.stdout.write(`Generated src/theme-constants/${fileName}\n`);
}
