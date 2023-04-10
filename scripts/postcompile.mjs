// @ts-check
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
import { rimraf } from 'rimraf';
import { glob } from 'glob';

/**
 * @type Promise<boolean> | undefined
 */
let rimrafPromise;
// Remove CJS .d.ts files: we don't need two copies!
try {
  const matches = await glob(`packages/*/dist/cjs/**/*.d.ts`);
  rimrafPromise = rimraf(matches);
} catch (err) {
  process.exit(1);
}

// Tell Node what kinds of files the ".js" files in these subdirectories are.
for (const dir of ['cache-control-types', 'plugin-response-cache', 'server']) {
  writeFileSync(
    path.join('packages', dir, 'dist', 'esm', 'package.json'),
    JSON.stringify({ type: 'module' }),
  );
  writeFileSync(
    path.join('packages', dir, 'dist', 'cjs', 'package.json'),
    JSON.stringify({ type: 'commonjs' }),
  );
}

await rimrafPromise;
