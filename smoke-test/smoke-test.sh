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

# Ensure that we at least type-check against a variety of versions of Apollo
# Gateway. Specifically:
# - 2.0.0 is the oldest supported version of v2.
# - 2.0.5 was the last version of 2.x before we converted it to use
#   `@apollo/server-gateway-interface` instead of directly depending on Apollo
#   Server packages
# - 2.x lets us test against the latest released 2.x version. (Theoretically it
#   would be better to pin a specific version and let Renovate update it so that
#   the Renovate PRs fail instead of `main` but this is simpler for now.)
#
# `--no-engine-strict` is required for some of the older ones on Node 18+,
# because we used to really like putting `<` engine constraints on all our
# packages.
#
# Prior to Apollo Server 5, we also tested against various versions of Gateway
# 0.x. However, Gateway 0.x has been EOL since September 2023, so we no longer
# test against it.
#
# This runs into some weird issues when we install the graphql@17 canary that
# seems to just be about ending up with two copies of `graphql` installed at
# different levels. For simplicity, we skip this part of the test in the canary
# jobs. Once graphql@17.0.0 is out we should be able to de-conditional this.
if [[ -z "${GRAPHQL_JS_VERSION:-}" ]]; then
  pushd gateway-compatibility
    for version in 2.0.0 2.0.5 2.x; do
      npm i --no-save --no-engine-strict "@apollo/gateway@$version"
      npx tsc --build tsconfig.json
    done
  popd
fi
