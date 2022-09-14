# @apollo/server

## 4.0.0-alpha.11

### Patch Changes

- [#6879](https://github.com/apollographql/apollo-server/pull/6879) [`6b37d169b`](https://github.com/apollographql/apollo-server/commit/6b37d169bc7163d49efdff37f5a3a5c3404806ff) Thanks [@bonnici](https://github.com/bonnici)! - Fixed usage reporting plugin log message

## 4.0.0-alpha.10

### Patch Changes

- [#6857](https://github.com/apollographql/apollo-server/pull/6857) [`15b1cb2e9`](https://github.com/apollographql/apollo-server/commit/15b1cb2e96d9ede9007d22f33b2f5a745f071dba) Thanks [@glasser](https://github.com/glasser)! - Errors thrown in resolvers and context functions can use `extensions.http` to affect the response status code and headers. The default behavior when a context function throws is now to always use status code 500 rather than comparing `extensions.code` to `INTERNAL_SERVER_ERROR`.

## 4.0.0-alpha.9

### Patch Changes

- [#6855](https://github.com/apollographql/apollo-server/pull/6855) [`3e4ab3fca`](https://github.com/apollographql/apollo-server/commit/3e4ab3fcafb72027bf3c6359884808ba11381315) Thanks [@glasser](https://github.com/glasser)! - New usage reporting option `sendTraces: false` to only send usage reports as aggregated statistics, not per-request traces.

* [#6855](https://github.com/apollographql/apollo-server/pull/6855) [`3e4ab3fca`](https://github.com/apollographql/apollo-server/commit/3e4ab3fcafb72027bf3c6359884808ba11381315) Thanks [@glasser](https://github.com/glasser)! - Remove Apollo-internal `internal_includeTracesContributingToStats`. This should not have been used other than inside Apollo's own servers.

- [#6855](https://github.com/apollographql/apollo-server/pull/6855) [`3e4ab3fca`](https://github.com/apollographql/apollo-server/commit/3e4ab3fcafb72027bf3c6359884808ba11381315) Thanks [@glasser](https://github.com/glasser)! - The usage reporting option `debugPrintReports` now displays reports via `logger.info` rather than `logger.warn`.

* [#6855](https://github.com/apollographql/apollo-server/pull/6855) [`3e4ab3fca`](https://github.com/apollographql/apollo-server/commit/3e4ab3fcafb72027bf3c6359884808ba11381315) Thanks [@glasser](https://github.com/glasser)! - Rename usage reporting option `sendErrorsInTraces` (added in 4.0.0-alpha.4) to `sendErrors`, as it also affects error statistics outside of traces.

## 4.0.0-alpha.8

### Patch Changes

- [#6841](https://github.com/apollographql/apollo-server/pull/6841) [`3320fee92`](https://github.com/apollographql/apollo-server/commit/3320fee922ffa50080aa63597c84844516583860) Thanks [@glasser](https://github.com/glasser)! - Upgrade @apollo/server-gateway-interface to have laxer definition of overallCachePolicy.

* [#6731](https://github.com/apollographql/apollo-server/pull/6731) [`9fc23f799`](https://github.com/apollographql/apollo-server/commit/9fc23f7995205e8239890197dbeaabc5db6fb073) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Use extensions for all imports to accommodate TS users using moduleResolution: "nodenext"

- [#6846](https://github.com/apollographql/apollo-server/pull/6846) [`2cab8f785`](https://github.com/apollographql/apollo-server/commit/2cab8f78580f6dacc64a497d06397b5b3cce89f6) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Ensure executionDidEnd hooks are only called once (when they throw)

## 4.0.0-alpha.7

### Patch Changes

- [#6817](https://github.com/apollographql/apollo-server/pull/6817) [`eca003fdc`](https://github.com/apollographql/apollo-server/commit/eca003fdc75bdb63153e68119b9891d2bffc6545) Thanks [@glasser](https://github.com/glasser)! - Move ApolloServerPluginGraphQLPlayground into its own package.

## 4.0.0-alpha.6

### Patch Changes

- [#6814](https://github.com/apollographql/apollo-server/pull/6814) [`cf0fcf49a`](https://github.com/apollographql/apollo-server/commit/cf0fcf49afa9b8ee12840f5ac4bf1be6320cb7e1) Thanks [@glasser](https://github.com/glasser)! - Several changes relating to plugins:

  - Remove the `server` field on `GraphQLRequestContext` and `GraphQLServerContext` (ie, the arguments to most plugin hook methods). This was added during AS4 development and did not exist in AS3.

  - Add `logger` and `cache` fields to `GraphQLRequestContext` and `GraphQLServerContext`. The `logger` fields and `GraphQLRequestContext.cache` existed in AS3 and had been previously removed for redundancy with the `server` field. (Unlike in AS3, `logger` is readonly.)

  - `ApolloServerPlugin` is now declared as `<in TContext extends BaseContext = BaseContext>` rather than `<in out TContext>`. This means that you can declare a plugin that doesn't care about `contextValue` to simply implement `ApolloServerPlugin` and it will work with any `ApolloServer<NoMatterWhatContext>`. This should make it easy to write plugins that don't care about context.

  - Remove the ability to specify a factory function as an element of the `plugins` list in the `ApolloServer` constructor. (Reducing the number of ways to specify constructor options helps keep type errors simpler.) As far as we know the main use case for this (referring to the `ApolloServer` itself when creating the plugin) can be handled with the new-in-AS4 `ApolloServer.addPlugin` method.

## 4.0.0-alpha.5

### Patch Changes

- [#6806](https://github.com/apollographql/apollo-server/pull/6806) [`bccc230f0`](https://github.com/apollographql/apollo-server/commit/bccc230f05761c15098df9a5e9f57f0c65cf4fa6) Thanks [@glasser](https://github.com/glasser)! - Rename response.http.statusCode back to status like it was in AS3.

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
