// This script updates packageVersion.ts to contain the version from
// package.json before compilation, and puts the original contents in
// .packageVersion.ts.original. A postcompile script moves the file back.

import assert from 'assert';
import path from 'path';
import { readFileSync, writeFileSync } from 'fs';

const { version } = JSON.parse(
  readFileSync(path.join('packages', 'server', 'package.json'), 'utf-8'),
);
assert.strictEqual(
  typeof version,
  'string',
  '"version" field missing from package.json',
);

const versionTSPath = path.join(
  'packages',
  'server',
  'src',
  'packageVersion.ts',
);
const versionTSOriginalPath = path.join(
  'packages',
  'server',
  'src',
  '.packageVersion.ts.original',
);

const originalContents = readFileSync(versionTSPath, 'utf-8');
writeFileSync(versionTSOriginalPath, originalContents);
const updatedContents = originalContents.replace(/\blocal\b/, version);

assert.notStrictEqual(
  updatedContents.indexOf(version),
  -1,
  'Failed to update version.ts with @apollo/server version',
);

writeFileSync(versionTSPath, updatedContents);
