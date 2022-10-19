# `apollo-reporting-protobuf`

> **Note:** The Apollo usage reporting API is subject to change.  We strongly
> encourage developers to contact Apollo support at `support@apollographql.com`
> to discuss their use case prior to building their own reporting agent using
> this module.

This module provides JavaScript/TypeScript
[Protocol buffer](https://developers.google.com/protocol-buffers/) definitions
for the Apollo usage reporting API.  These definitions are generated for
consumption from the `reports.proto` file which is defined internally within
Apollo.

## Development

> **Note:** Due to a dependency on Unix tools (e.g. `bash`, `grep`, etc.), the
> development of this module requires a Unix system.  There is no reason why
> this can't be avoided, the time just hasn't been taken to make those changes.
> We'd happily accept a PR which makes the appropriate changes!

Currently, this package generates a majority of its code with
`@apollo/protobufjs` (a fork of
[`protobufjs`](https://www.npmjs.com/package/protobufjs) that we maintain
specifically for this package) based on the `reports.proto` file. The output is
generated with the `generate` npm script.

The root of the repository provides some `devDependencies` necessary to build
these definitions; these will be installed by running `npm install` at the root
of this workspace. When making changes to this module, run scripts via `npm run
SCRIPTNAME -w @apollo/usage-reporting-protobuf` in the **root** of this monorepo in
order to update the definitions in _this_ module. The `-w` flag is shorthand for
`--workspace`; this monorepo leverages NPM workspaces to manage its packages.

To update `reports.proto` to the current version recognized by the Studio usage
reporting ingress, run `npm run update-proto -w
@apollo/usage-reporting-protobuf`. To then regenerate the JS and TS files, run
`npm run generate -w @apollo/usage-reporting-protobuf`. We check in the
generated code and only regenerate it manually, partially to make builds faster
(no need to run pbjs on every `npm install`) and partially so that we don't have
to make sure that `pbjs` runs on every Node version that we support.
