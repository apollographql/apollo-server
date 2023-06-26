# @apollo/usage-reporting-protobuf

## 4.1.1

### Patch Changes

- [#7614](https://github.com/apollographql/apollo-server/pull/7614) [`4fadf3ddc`](https://github.com/apollographql/apollo-server/commit/4fadf3ddc9611e050dd0f08d51252ed9b0c0d9e1) Thanks [@Cellule](https://github.com/Cellule)! - Publish TypeScript typings for CommonJS modules output.

  This allows TypeScript projects that use CommonJS modules with
  `moduleResolution: "node16"` or
  `moduleResolution: "nodeNext"`
  to correctly resolves the typings of apollo's packages as CommonJS instead of ESM.

## 4.1.0

### Minor Changes

- [#7411](https://github.com/apollographql/apollo-server/pull/7411) [`021460e95`](https://github.com/apollographql/apollo-server/commit/021460e95c34ce921dc1c8caa3e5ded3463487ee) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Update protobuf which includes updates for supporting (notably) ConditionNode in the gateway

## 4.0.2

### Patch Changes

- [#7134](https://github.com/apollographql/apollo-server/pull/7134) [`361ca5c8e`](https://github.com/apollographql/apollo-server/commit/361ca5c8ed064932945e93bd069b06b5c4633cb1) Thanks [@renovate](https://github.com/apps/renovate)! - Update `@apollo/protobufjs` to drop its hopefully-unnecessary dependency on (an old version of) `@types/node`.

## 4.0.1

### Patch Changes

- [#7095](https://github.com/apollographql/apollo-server/pull/7095) [`72111f970`](https://github.com/apollographql/apollo-server/commit/72111f970e80bcf8538a002c08ce4a3d0da318d9) Thanks [@alex-statsig](https://github.com/alex-statsig)! - Include `main` and `module` fields in package.json for build tools that look for them instead of `exports`.

## 4.0.0

Initial release of `@apollo/usage-reporting-protobuf` with support for Apollo Server 4. The version of this plugin designed for Apollo Server 2 and 3 was named `apollo-reporting-protobuf`. This is an internal implementation detail of Apollo Server and is not intended for general direct use.
