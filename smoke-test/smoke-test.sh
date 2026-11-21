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

# Ensure that we at least type-check against a couple of versions of Apollo
# Gateway. Specifically:
# - 2.14.5 is the oldest version of `@apollo/gateway` whose peer dependency and
#   type definitions accept graphql@17, so it is the oldest version that can be
#   used with Apollo Server 6. (Earlier 2.x versions only type-check against
#   graphql@16.)
# - 2.x lets us test against the latest released 2.x version. (Theoretically it
#   would be better to pin a specific version and let Renovate update it so that
#   the Renovate PRs fail instead of `main` but this is simpler for now.)
#
# Prior to Apollo Server 5, we also tested against various versions of Gateway
# 0.x. However, Gateway 0.x has been EOL since September 2023, so we no longer
# test against it.
pushd gateway-compatibility
  for version in 2.14.5 2.x; do
    npm i --no-save "@apollo/gateway@$version"
    npx tsc --build tsconfig.json
  done
popd
