// This script writes package.json files to the ESM and CJS generated code
// directories teaching Node that .js files in those directories use the
// corresponding module formats. It also removes all the .d.ts files from cjs
// since we only need one copy (and package.json points at the esm one). (It
// doesn't revert the packageVersion.ts update from precompile.ts; that gets
// done directly in the compile script, whether or not tsc succeeds.)
//
// This script expects to be run from the project root (as `npm run` does).

import path from 'path';
import { writeFileSync } from 'fs';
import rimraf from 'rimraf';

// Tell Node what kinds of files the ".js" files in these subdirectories are.
writeFileSync(
  path.join('packages', 'server', 'dist', 'esm', 'package.json'),
  JSON.stringify({ type: 'module' }),
);
writeFileSync(
  path.join('packages', 'server', 'dist', 'cjs', 'package.json'),
  JSON.stringify({ type: 'commonjs' }),
);

// Remove CJS .d.ts files: we don't need two copies!
rimraf.sync('packages/server/dist/cjs/**/*.d.ts');
