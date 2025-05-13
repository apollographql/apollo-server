#!/bin/bash

# As far as we can tell, `npm deprecate` only deprecates currently existing
# package versions. Whenever we publish a backport to AS2/AS3, the latest
# version will end up not deprecated! So after publishing backport versions, we
# run this script (with apollo-bot credentials). You must provide an OTP env
# variable in order for this script to run (it does indeed use the OTP more than
# once, but it works). Note: when I ran this last (8/22/23) I got a bunch of 422
# errors from NPM, but it still worked.
# https://stackoverflow.com/questions/74466186/keeping-npm-deprecated-packages-deprecated

set -e

if [ -z "$OTP" ]; then
  echo "Error: OTP required to run npm deprecation. Set the OTP env var (OTP=xyz) and run again."
  exit 1
fi

with_replacement() {
  npm deprecate $1 'The `'"$1"'` package is part of Apollo Server v2 and v3, which are now end-of-life (as of October 22nd 2023 and October 22nd 2024, respectively). This package'"'"'s functionality is now found in the `'"$2"'` package. See https://www.apollographql.com/docs/apollo-server/previous-versions/ for more details.' --otp=$OTP &
}

with_replacement apollo-server @apollo/server
with_replacement apollo-server-core @apollo/server
with_replacement apollo-server-express @apollo/server
with_replacement apollo-server-errors @apollo/server
with_replacement apollo-server-plugin-base @apollo/server
with_replacement apollo-server-types @apollo/server
with_replacement apollo-datasource-rest @apollo/datasource-rest
with_replacement apollo-reporting-protobuf @apollo/usage-reporting-protobuf
with_replacement apollo-server-env @apollo/utils.fetcher
with_replacement apollo-server-plugin-response-cache @apollo/server-plugin-response-cache
with_replacement apollo-server-azure-functions @apollo/server
with_replacement apollo-server-cloud-functions @apollo/server
with_replacement apollo-server-cloudflare @apollo/server
with_replacement apollo-server-fastify @apollo/server
with_replacement apollo-server-hapi @apollo/server
with_replacement apollo-server-koa @apollo/server
with_replacement apollo-server-lambda @apollo/server
with_replacement apollo-server-micro @apollo/server

# This package isn't exactly replaced, so leave that sentence off.
npm deprecate apollo-datasource 'The `apollo-datasource` package is part of Apollo Server v2 and v3, which are now end-of-life (as of October 22nd 2023 and October 22nd 2024, respectively). See https://www.apollographql.com/docs/apollo-server/previous-versions/ for more details.' --otp=$OTP &

caching() {
  npm deprecate $1 'This package is part of the legacy caching implementation used by Apollo Server v2 and v3, and is no longer maintained. We recommend you switch to the newer Keyv-based implementation (which is compatible with all versions of Apollo Server). See https://www.apollographql.com/docs/apollo-server/v3/performance/cache-backends#legacy-caching-implementation for more details.' --otp=$OTP &
}

caching apollo-server-caching
caching apollo-server-cache-memcached
caching apollo-server-cache-redis
