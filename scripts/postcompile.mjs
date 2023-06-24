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

const packages = [
  { dir: 'cache-control-types' },
  { dir: 'gateway-interface' },
  { dir: 'plugin-response-cache' },
  { dir: 'server' },
  { dir: 'usage-reporting-protobuf', outDir: 'generated' },
];
// Tell Node what kinds of files the ".js" files in these subdirectories are.
for (const { dir, outDir = 'dist' } of packages) {
  writeFileSync(
    path.join('packages', dir, outDir, 'esm', 'package.json'),
    JSON.stringify({ type: 'module' }),
  );
  writeFileSync(
    path.join('packages', dir, outDir, 'cjs', 'package.json'),
    JSON.stringify({ type: 'commonjs' }),
  );
}
