#!/bin/bash

set -e
set -x

TARBALL_DIR=$(mktemp -d)

# Make tarballs of all packages.
npm pack --pack-destination="$TARBALL_DIR" --workspaces=true

# Install node_modules in the smoke-test directory
cd smoke-test
rm -rf node_modules package-lock.json
# First install normal dependencies
npm i
# Now install the tarballs we made (but don't write their paths to package.json)
npm i --no-save "$TARBALL_DIR"/*.tgz
rm package-lock.json
rm -rf "$TARBALL_DIR"
