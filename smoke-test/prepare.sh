#!/bin/bash

set -e
set -x

TARBALL_DIR=$(mktemp -d)

# Ensure build is current.
npm run compile
# Make tarballs of all packages.
npm pack --pack-destination="$TARBALL_DIR" --workspaces=true

# Install node_modules in the smoke-test directory
cd smoke-test
rm -rf node_modules package-lock.json generated
# First install normal dependencies
npm i

# Now install the tarballs we made (but don't write their paths to package.json).
# And also install a graphql prerelease if we need to.
if [[ -n "${GRAPHQL_JS_VERSION:-}" ]]; then
  npm i --no-save --legacy-peer-deps \
    "$TARBALL_DIR"/*.tgz \
    "graphql@${GRAPHQL_JS_VERSION}"
else
  npm i --no-save "$TARBALL_DIR"/*.tgz
fi

rm package-lock.json
rm -rf "$TARBALL_DIR"
