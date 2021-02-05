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
[`protobufjs`](https://www.npmjs.com/package/protobufjs) based on the
`reports.proto` file. The output is generated with the `prepare` npm script.

The root of the repository provides the `devDependencies` necessary to build
these definitions (e.g. `pbjs`, `pbts`, `protobuf`, etc.) and the `prepare`
npm script is invoked programmatically via the monorepo tooling (e.g. Lerna)
thanks to _this_ module's `postinstall` script.   Therefore, when making
changes to this module, `npx lerna run prepare` should be run from the **root**
of this monorepo in order to update the definitions in _this_ module.
