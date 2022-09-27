# @apollo/server-plugin-response-cache

## 4.0.0-rc.6

### Patch Changes

- [#6961](https://github.com/apollographql/apollo-server/pull/6961) [`a782c791f`](https://github.com/apollographql/apollo-server/commit/a782c791f4f616e36a0036dcabb4d928a7c3f871) Thanks [@glasser](https://github.com/glasser)! - Require graphql@16.6 as a peer dependency.

- Updated dependencies [[`a782c791f`](https://github.com/apollographql/apollo-server/commit/a782c791f4f616e36a0036dcabb4d928a7c3f871), [`d3ea2d4ef`](https://github.com/apollographql/apollo-server/commit/d3ea2d4ef137519d073185dea778e39e89a301c2)]:
  - @apollo/server@4.0.0-rc.14

## 4.0.0-alpha.5

### Patch Changes

- [#6827](https://github.com/apollographql/apollo-server/pull/6827) [`0c2909aa1`](https://github.com/apollographql/apollo-server/commit/0c2909aa1593a9b0abf299b071629a4ab23dc71b) Thanks [@glasser](https://github.com/glasser)! - Experimental support for incremental delivery (`@defer`/`@stream`) when combined with a prerelease of `graphql-js`.

- Updated dependencies [[`0c2909aa1`](https://github.com/apollographql/apollo-server/commit/0c2909aa1593a9b0abf299b071629a4ab23dc71b), [`0c2909aa1`](https://github.com/apollographql/apollo-server/commit/0c2909aa1593a9b0abf299b071629a4ab23dc71b)]:
  - @apollo/server@4.0.0-alpha.12

## 4.0.0-alpha.4

### Patch Changes

- [#6814](https://github.com/apollographql/apollo-server/pull/6814) [`cf0fcf49a`](https://github.com/apollographql/apollo-server/commit/cf0fcf49afa9b8ee12840f5ac4bf1be6320cb7e1) Thanks [@glasser](https://github.com/glasser)! - Several changes relating to plugins:

  - Remove the `server` field on `GraphQLRequestContext` and `GraphQLServerContext` (ie, the arguments to most plugin hook methods). This was added during AS4 development and did not exist in AS3.

  - Add `logger` and `cache` fields to `GraphQLRequestContext` and `GraphQLServerContext`. The `logger` fields and `GraphQLRequestContext.cache` existed in AS3 and had been previously removed for redundancy with the `server` field. (Unlike in AS3, `logger` is readonly.)

  - `ApolloServerPlugin` is now declared as `<in TContext extends BaseContext = BaseContext>` rather than `<in out TContext>`. This means that you can declare a plugin that doesn't care about `contextValue` to simply implement `ApolloServerPlugin` and it will work with any `ApolloServer<NoMatterWhatContext>`. This should make it easy to write plugins that don't care about context.

  - Remove the ability to specify a factory function as an element of the `plugins` list in the `ApolloServer` constructor. (Reducing the number of ways to specify constructor options helps keep type errors simpler.) As far as we know the main use case for this (referring to the `ApolloServer` itself when creating the plugin) can be handled with the new-in-AS4 `ApolloServer.addPlugin` method.

- Updated dependencies [[`cf0fcf49a`](https://github.com/apollographql/apollo-server/commit/cf0fcf49afa9b8ee12840f5ac4bf1be6320cb7e1)]:
  - @apollo/server@4.0.0-alpha.6

## 4.0.0-alpha.3

### Patch Changes

- [#6806](https://github.com/apollographql/apollo-server/pull/6806) [`bccc230f0`](https://github.com/apollographql/apollo-server/commit/bccc230f05761c15098df9a5e9f57f0c65cf4fa6) Thanks [@glasser](https://github.com/glasser)! - Rename response.http.statusCode back to status like it was in AS3.

- Updated dependencies [[`bccc230f0`](https://github.com/apollographql/apollo-server/commit/bccc230f05761c15098df9a5e9f57f0c65cf4fa6)]:
  - @apollo/server@4.0.0-alpha.5

## 4.0.0-alpha.2

### Patch Changes

- [#6764](https://github.com/apollographql/apollo-server/pull/6764) [`c4115e96a`](https://github.com/apollographql/apollo-server/commit/c4115e96ac75e04cffe1c3353fc03ea65dcab909) Thanks [@glasser](https://github.com/glasser)! - Get cache-control types from @apollo/cache-control-types; no more `declare module` for info.cacheControl

- Updated dependencies [[`bce9150f3`](https://github.com/apollographql/apollo-server/commit/bce9150f31d6fd58b7a6622611ec7b35b3564aa6), [`c4115e96a`](https://github.com/apollographql/apollo-server/commit/c4115e96ac75e04cffe1c3353fc03ea65dcab909), [`6ef6a090c`](https://github.com/apollographql/apollo-server/commit/6ef6a090cff26f5d98e9965cd839307931e12516), [`536e038a7`](https://github.com/apollographql/apollo-server/commit/536e038a744738f740072781f32e83a360ec0744)]:
  - @apollo/server@4.0.0-alpha.3

## 4.0.0-alpha.1

### Patch Changes

- [#6357](https://github.com/apollographql/apollo-server/pull/6357) [`7c3c825d8`](https://github.com/apollographql/apollo-server/commit/7c3c825d834ddad778de8b6d4254e56613fe8534) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Export ApolloServerErrorCode enum instead of error classes. HTTPGraphQLRequest takes search params as raw string.

- Updated dependencies [[`7c3c825d8`](https://github.com/apollographql/apollo-server/commit/7c3c825d834ddad778de8b6d4254e56613fe8534)]:
  - @apollo/server@4.0.0-alpha.1

## 4.0.0-alpha.0

### Major Changes

- [`f39d9eec7`](https://github.com/apollographql/apollo-server/commit/f39d9eec7ab72d0f471a0bb0646dd42ad81c56cf) Thanks [@glasser](https://github.com/glasser)! - Initial Apollo Server 4 release

### Patch Changes

- Updated dependencies [[`f39d9eec7`](https://github.com/apollographql/apollo-server/commit/f39d9eec7ab72d0f471a0bb0646dd42ad81c56cf)]:
  - @apollo/server@4.0.0-alpha.0
