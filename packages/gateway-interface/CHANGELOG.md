# @apollo/server-gateway-interface

## 1.1.1

### Patch Changes

- [#7614](https://github.com/apollographql/apollo-server/pull/7614) [`4fadf3ddc`](https://github.com/apollographql/apollo-server/commit/4fadf3ddc9611e050dd0f08d51252ed9b0c0d9e1) Thanks [@Cellule](https://github.com/Cellule)! - Publish TypeScript typings for CommonJS modules output.

  This allows TypeScript projects that use CommonJS modules with
  `moduleResolution: "node16"` or
  `moduleResolution: "nodeNext"`
  to correctly resolves the typings of apollo's packages as CommonJS instead of ESM.

- Updated dependencies [[`4fadf3ddc`](https://github.com/apollographql/apollo-server/commit/4fadf3ddc9611e050dd0f08d51252ed9b0c0d9e1)]:
  - @apollo/usage-reporting-protobuf@4.1.1

## 1.1.0

### Minor Changes

- [#7325](https://github.com/apollographql/apollo-server/pull/7325) [`e0f959a63`](https://github.com/apollographql/apollo-server/commit/e0f959a637c1bc4f07cc8c8dac3a078c7debc9ad) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Add optional `nonFtv1ErrorPaths` to Gateway metrics data. This change is a prerequisite to:
  - https://github.com/apollographql/federation/pull/2242
  - https://github.com/apollographql/apollo-server/pull/7136

## 1.0.7

### Patch Changes

- [#7187](https://github.com/apollographql/apollo-server/pull/7187) [`3fd7b5f26`](https://github.com/apollographql/apollo-server/commit/3fd7b5f26144a02e711037b7058a8471e9648bc8) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Update `@apollo/utils.keyvaluecache` dependency to the latest patch which correctly specifies its version of `lru-cache`.

## 1.0.6

### Patch Changes

- [#7170](https://github.com/apollographql/apollo-server/pull/7170) [`4ce738193`](https://github.com/apollographql/apollo-server/commit/4ce738193f8d073287c34f84c0346276ae2efc30) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Update @apollo/utils packages to v2 (dropping node 12 support)

- [#7173](https://github.com/apollographql/apollo-server/pull/7173) [`45856e1dd`](https://github.com/apollographql/apollo-server/commit/45856e1ddfd646c93682d3d8475bf77fbcc1c22c) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Remove unnecessary engines constraint on types-only package

## 1.0.5

### Patch Changes

- [#7118](https://github.com/apollographql/apollo-server/pull/7118) [`c835637be`](https://github.com/apollographql/apollo-server/commit/c835637be07929e3bebe8f3b262588c6d918e694) Thanks [@glasser](https://github.com/glasser)! - Provide new `GraphQLRequestContext.requestIsBatched` field to gateways, because we did add it in a backport to AS3 and the gateway interface is based on AS3.

## 1.0.4

### Patch Changes

- [#203](https://github.com/apollographql/apollo-utils/pull/203) [`68ba755`](https://github.com/apollographql/apollo-utils/commit/68ba755fd54df123408a11a217400711e82f30cf) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Update to latest release of Apollo Server dependencies

## 1.0.3

### Patch Changes

- [#191](https://github.com/apollographql/apollo-utils/pull/191) [`5f34436`](https://github.com/apollographql/apollo-utils/commit/5f344367345d297ea2caae4b7c4eb9ec224f2105) Thanks [@glasser](https://github.com/glasser)! - Now make the interface compatible with Apollo Server 3 again.

## 1.0.2

### Patch Changes

- [#184](https://github.com/apollographql/apollo-utils/pull/184) [`9d8c7c7`](https://github.com/apollographql/apollo-utils/commit/9d8c7c778626b818e74c741593aaf6e367c6457a) Thanks [@glasser](https://github.com/glasser)! - Make the interface more compatible with Apollo Server 2

## 1.0.1

### Patch Changes

- [#179](https://github.com/apollographql/apollo-utils/pull/179) [`27547f8`](https://github.com/apollographql/apollo-utils/commit/27547f836dae5da88c51198ff83e7c042988b635) Thanks [@glasser](https://github.com/glasser)! - Declare support for Node 12

## 1.0.0

### Major Changes

- [#175](https://github.com/apollographql/apollo-utils/pull/175) [`49a8c8f`](https://github.com/apollographql/apollo-utils/commit/49a8c8f493c3d571a50927fe2235c4f79b903802) Thanks [@glasser](https://github.com/glasser)! - New package, representing AS3-style interface between Apollo Server and Apollo Gateway
