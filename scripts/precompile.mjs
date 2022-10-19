// This script updates packageVersion.ts to contain the version from
// package.json. That file is gitignored and this script gets run by
// "precompile".
//
// This assumes that we always publish packages from a fresh checkout rather
// than running `changeset version` and then `changeset publish` from the same
// checkout without `npm run compile` in between.
//
// This script expects to be run from the project root (as `npm run` does).

import assert from 'assert';
import path from 'path';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const { version } = JSON.parse(
  readFileSync(path.join('packages', 'server', 'package.json'), 'utf-8'),
);
assert.strictEqual(
  typeof version,
  'string',
  '"version" field missing from package.json',
);

const versionTSDirectory = path.join('packages', 'server', 'src', 'generated');
mkdirSync(versionTSDirectory, { recursive: true });

writeFileSync(
  path.join(versionTSDirectory, 'packageVersion.ts'),
  `export const packageVersion = ${JSON.stringify(version)};\n`,
);
