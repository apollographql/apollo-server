#!/bin/bash

set -e
set -x

# Go to the directory of this script.
cd "$(dirname "${BASH_SOURCE[0]}")"

node smoke-test.cjs

node smoke-test.mjs

node smoke-test-no-standalone.mjs

# Use rollup to bundle some ESM code. We want to see that the one that doesn't
# use `@apollo/server/standalone` doesn't need to include npm modules only used
# by `startStandaloneServer` such as `body-parser`.
ROLLUP_OUT_DIR=$(mktemp -d)
npx rollup smoke-test.mjs --config rollup.config.mjs --silent --file "$ROLLUP_OUT_DIR"/bundle.mjs
npx rollup smoke-test-no-standalone.mjs --config rollup.config.mjs --silent --file "$ROLLUP_OUT_DIR"/bundle-no-standalone.mjs

# Check that the bundle that uses startStandaloneServer has this string from body-parser:
grep 'Create a middleware to parse JSON bodies' "$ROLLUP_OUT_DIR"/bundle.mjs
# ... and that the one that doesn't, doesn't.
! grep 'Create a middleware to parse JSON bodies' "$ROLLUP_OUT_DIR"/bundle-no-standalone.mjs

# Nodenext needs its own special folder - for this test to exercise the case
# we're after, we need a package.json using type: module and a bleeding edge
# tsconfig using moduleResolution: nodenext. Let's run it before the others
# since this is the "pickiest" of the tests.
pushd nodenext
  npx tsc --build .
  node ./dist/smoke-test.js
popd

# Ensure basic TypeScript builds work.
npx tsc --build tsconfig.{esm,cjs,cjs-nodenext,cjs-node16}.json
node generated/tsc/smoke-test.cjs
node generated/tsc/variants/nodenext/smoke-test.cjs
node generated/tsc/variants/node16/smoke-test.cjs
node generated/tsc/smoke-test.mjs

# We used to type-check against a variety of versions of Apollo Gateway here
# (see `gateway-compatibility`). No released version of `@apollo/gateway`
# supports graphql@17 (it declares a graphql@16 peer dependency and its type
# definitions don't compile against graphql@17), so we skip this step until one
# does. To re-enable it, run in `gateway-compatibility`:
#
#   npm i --no-save --no-engine-strict "@apollo/gateway@2.x"
#   npx tsc --build tsconfig.json
