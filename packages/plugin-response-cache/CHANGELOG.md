# @apollo/server-plugin-response-cache

## 4.1.4

### Patch Changes

- [#8010](https://github.com/apollographql/apollo-server/pull/8010) [`f4228e8`](https://github.com/apollographql/apollo-server/commit/f4228e88509b4cd2f50cf10bc6376d48488e03c1) Thanks [@glasser](https://github.com/glasser)! - Compatibility with Next.js Turbopack. Fixes #8004.

## 4.1.3

### Patch Changes

- [#7614](https://github.com/apollographql/apollo-server/pull/7614) [`4fadf3ddc`](https://github.com/apollographql/apollo-server/commit/4fadf3ddc9611e050dd0f08d51252ed9b0c0d9e1) Thanks [@Cellule](https://github.com/Cellule)! - Publish TypeScript typings for CommonJS modules output.

  This allows TypeScript projects that use CommonJS modules with
  `moduleResolution: "node16"` or
  `moduleResolution: "nodeNext"`
  to correctly resolves the typings of apollo's packages as CommonJS instead of ESM.

## 4.1.2

### Patch Changes

- [#7454](https://github.com/apollographql/apollo-server/pull/7454) [`f6e3ae021`](https://github.com/apollographql/apollo-server/commit/f6e3ae021417c3b54200f8d3fcf4366dc3518998) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Start building packages with TS 5.x, which should have no effect for users

## 4.1.1

### Patch Changes

- [#7439](https://github.com/apollographql/apollo-server/pull/7439) [`4668f4594`](https://github.com/apollographql/apollo-server/commit/4668f4594d2a3775a3b52fae4e896ac8c607792a) Thanks [@Igloczek](https://github.com/Igloczek)! - Export types from response cache plugin

## 4.1.0

### Minor Changes

- [#7241](https://github.com/apollographql/apollo-server/pull/7241) [`d7e9b9759`](https://github.com/apollographql/apollo-server/commit/d7e9b97595b063f1e796ec4449850a16d19e8b18) Thanks [@glasser](https://github.com/glasser)! - If the cache you provide to the `cache` option is created with `PrefixingKeyValueCache.cacheDangerouslyDoesNotNeedPrefixesForIsolation` (new in `@apollo/utils.keyvaluecache@2.1.0`), the `fqc:` prefix will not be added to cache keys.

## 4.0.3

### Patch Changes

- [#7187](https://github.com/apollographql/apollo-server/pull/7187) [`3fd7b5f26`](https://github.com/apollographql/apollo-server/commit/3fd7b5f26144a02e711037b7058a8471e9648bc8) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Update `@apollo/utils.keyvaluecache` dependency to the latest patch which correctly specifies its version of `lru-cache`.

## 4.0.2

### Patch Changes

- [#7170](https://github.com/apollographql/apollo-server/pull/7170) [`4ce738193`](https://github.com/apollographql/apollo-server/commit/4ce738193f8d073287c34f84c0346276ae2efc30) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Update @apollo/utils packages to v2 (dropping node 12 support)

## 4.0.1

### Patch Changes

- [#7049](https://github.com/apollographql/apollo-server/pull/7049) [`3daee02c6`](https://github.com/apollographql/apollo-server/commit/3daee02c6a0fa34ea0e6f4f18b9a7308539021e3) Thanks [@glasser](https://github.com/glasser)! - Raise minimum `engines` requirement from Node.js v14.0.0 to v14.16.0. This is the minimum version of Node 14 supported by the `engines` requirement of `graphql@16.6.0`.

- Updated dependencies [[`3daee02c6`](https://github.com/apollographql/apollo-server/commit/3daee02c6a0fa34ea0e6f4f18b9a7308539021e3), [`3daee02c6`](https://github.com/apollographql/apollo-server/commit/3daee02c6a0fa34ea0e6f4f18b9a7308539021e3)]:
  - @apollo/server@4.0.1

## 4.0.0

Initial release of `@apollo/server-plugin-response-cache` with support for Apollo Server 4. The version of this plugin designed for Apollo Server 2 and 3 was named `apollo-server-plugin-response-cache`.
