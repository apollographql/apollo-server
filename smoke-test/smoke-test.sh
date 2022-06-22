#!/bin/bash

set -e
set -x

# Go to the directory of this script.
cd "$(dirname "${BASH_SOURCE[0]}")"

node smoke-test.cjs

node smoke-test.mjs

node smoke-test-no-express.mjs

# Use rollup to bundle some ESM code. We want to see that the one that doesn't
# use `@apollo/server/standalone` doesn't need to include `express`.
ROLLUP_OUT_DIR=$(mktemp -d)
npx rollup smoke-test.mjs --config rollup.config.js --silent --file "$ROLLUP_OUT_DIR"/bundle.mjs
npx rollup smoke-test-no-express.mjs --config rollup.config.js --silent --file "$ROLLUP_OUT_DIR"/bundle-no-express.mjs

# Check that the bundle that uses startStandaloneServer has this string from express:
grep 'function createApplication' "$ROLLUP_OUT_DIR"/bundle.mjs
# ... and that the one that doesn't, doesn't.
! grep 'function createApplication' "$ROLLUP_OUT_DIR"/bundle-no-express.mjs

# Ensure basic TypeScript builds work.
tsc --build tsconfig.{esm,cjs}.json
node generated/tsc/smoke-test.cjs
node generated/tsc/smoke-test.mjs
