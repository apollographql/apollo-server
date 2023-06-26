# @apollo/cache-control-types

## 1.0.3

### Patch Changes

- [#7614](https://github.com/apollographql/apollo-server/pull/7614) [`4fadf3ddc`](https://github.com/apollographql/apollo-server/commit/4fadf3ddc9611e050dd0f08d51252ed9b0c0d9e1) Thanks [@Cellule](https://github.com/Cellule)! - Publish TypeScript typings for CommonJS modules output.

  This allows TypeScript projects that use CommonJS modules with
  `moduleResolution: "node16"` or
  `moduleResolution: "nodeNext"`
  to correctly resolves the typings of apollo's packages as CommonJS instead of ESM.

## 1.0.2

### Patch Changes

- [#173](https://github.com/apollographql/apollo-utils/pull/173) [`b231e5d`](https://github.com/apollographql/apollo-utils/commit/b231e5d57d4598661f22cb7338ecd2fff0222b54) Thanks [@glasser](https://github.com/glasser)! - Fix build when combined with the old `declare module`

## 1.0.1

### Patch Changes

- [#171](https://github.com/apollographql/apollo-utils/pull/171) [`e8d3a72`](https://github.com/apollographql/apollo-utils/commit/e8d3a72834b80930478d21e9bf1fa50d039c127a) Thanks [@glasser](https://github.com/glasser)! - Add missing "main" to package.json

## 1.0.0

### Major Changes

- [#168](https://github.com/apollographql/apollo-utils/pull/168) [`9cc9b9a`](https://github.com/apollographql/apollo-utils/commit/9cc9b9a4ea9618907abdb485d0780f4444f959de) Thanks [@glasser](https://github.com/glasser)! - New package, extracted from Apollo Server 4 alpha
