# @apollo/server

## 4.0.0-alpha.4

### Patch Changes

- [#6788](https://github.com/apollographql/apollo-server/pull/6788) [`13f809ca6`](https://github.com/apollographql/apollo-server/commit/13f809ca6c5e1f0be9d05823f1194a8743321a79) Thanks [@glasser](https://github.com/glasser)! - `parseOptions` is now only used for parsing operations, not for schemas too. Its TS type now only includes options recognized by `graphql-js` itself.

* [#6785](https://github.com/apollographql/apollo-server/pull/6785) [`96178c570`](https://github.com/apollographql/apollo-server/commit/96178c57070af574fbcff7f51b73924c576725db) Thanks [@renovate](https://github.com/apps/renovate)! - Update internal use of `@graphql-tools/schema` from v8 to v9. This should be a no-op; we have already removed the feature that would have been affected by the API change in this upgrade (passing `parseOptions` to `makeExecutableSchema`).

- [#6792](https://github.com/apollographql/apollo-server/pull/6792) [`400f7867b`](https://github.com/apollographql/apollo-server/commit/400f7867b521359fd7213547c88fcf3fc8fbe94c) Thanks [@glasser](https://github.com/glasser)! - Port GHSA-2fvv-qxrq-7jq6 fix from v3 (remove XSS from default landing page HTML)

* [#6794](https://github.com/apollographql/apollo-server/pull/6794) [`7445d3377`](https://github.com/apollographql/apollo-server/commit/7445d3377d16cdc65506131572c0a616d3a6324c) Thanks [@glasser](https://github.com/glasser)! - Usage reporting and inline trace plugins: replace `rewriteError` with `sendErrorsInTraces`/`includeErrors`, and mask all errors by default.

## 4.0.0-alpha.3

### Patch Changes

- [#6771](https://github.com/apollographql/apollo-server/pull/6771) [`bce9150f3`](https://github.com/apollographql/apollo-server/commit/bce9150f31d6fd58b7a6622611ec7b35b3564aa6) Thanks [@glasser](https://github.com/glasser)! - Support Gateway. Remove executor constructor option.

* [#6764](https://github.com/apollographql/apollo-server/pull/6764) [`c4115e96a`](https://github.com/apollographql/apollo-server/commit/c4115e96ac75e04cffe1c3353fc03ea65dcab909) Thanks [@glasser](https://github.com/glasser)! - Get cache-control types from @apollo/cache-control-types; no more `declare module` for info.cacheControl

- [#6759](https://github.com/apollographql/apollo-server/pull/6759) [`6ef6a090c`](https://github.com/apollographql/apollo-server/commit/6ef6a090cff26f5d98e9965cd839307931e12516) Thanks [@glasser](https://github.com/glasser)! - Refactor error formatting.

  Remove `error.extensions.exception`; you can add it back yourself with `formatError`. `error.extensions.exception.stacktrace` is now available on `error.extensions.stacktrace`.

  Provide `unwrapResolverError` function in `@apollo/server/errors`; useful for your `formatError` hook.

  No more TS `declare module` describing the `exception` extension (partially incorrectly).

  Rename the (new in v4) constructor option `includeStackTracesInErrorResponses` to `includeStacktraceInErrorResponses`.

* [#6765](https://github.com/apollographql/apollo-server/pull/6765) [`536e038a7`](https://github.com/apollographql/apollo-server/commit/536e038a744738f740072781f32e83a360ec0744) Thanks [@glasser](https://github.com/glasser)! - Port #6763 from AS3 (fix fieldLevelInstrumentation type declaration)

## 4.0.0-alpha.2

### Patch Changes

- [#6357](https://github.com/apollographql/apollo-server/pull/6357) [`f736b4980`](https://github.com/apollographql/apollo-server/commit/f736b4980b39f3b563939b100eff85e073189cb1) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Port #6709 from AS3 (improve an error message)

## 4.0.0-alpha.1

### Patch Changes

- [#6357](https://github.com/apollographql/apollo-server/pull/6357) [`7c3c825d8`](https://github.com/apollographql/apollo-server/commit/7c3c825d834ddad778de8b6d4254e56613fe8534) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Export ApolloServerErrorCode enum instead of error classes. HTTPGraphQLRequest takes search params as raw string.

- Updated dependencies [[`7c3c825d8`](https://github.com/apollographql/apollo-server/commit/7c3c825d834ddad778de8b6d4254e56613fe8534)]:
  - @apollo/usage-reporting-protobuf@4.0.0-alpha.1

## 4.0.0-alpha.0

### Major Changes

- [`f39d9eec7`](https://github.com/apollographql/apollo-server/commit/f39d9eec7ab72d0f471a0bb0646dd42ad81c56cf) Thanks [@glasser](https://github.com/glasser)! - Initial Apollo Server 4 release

### Patch Changes

- Updated dependencies [[`f39d9eec7`](https://github.com/apollographql/apollo-server/commit/f39d9eec7ab72d0f471a0bb0646dd42ad81c56cf)]:
  - @apollo/usage-reporting-protobuf@4.0.0-alpha.0
