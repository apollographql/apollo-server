# Usage reporting protobuf

> **Note:** The Apollo usage reporting API is subject to change.  We strongly
> encourage developers to contact Apollo support at `support@apollographql.com`
> to discuss their use case prior to building their own reporting agent using
> this module.

This subdirectory provides JavaScript/TypeScript [Protocol
buffer](https://developers.google.com/protocol-buffers/) definitions for the
Apollo usage reporting API.  These definitions are generated for consumption
from the `reports.proto` file which is defined internally within Apollo.

## Development

> **Note:** Due to a dependency on Unix tools (e.g. `bash`, `grep`, etc.), the
> development of this module requires a Unix system.  There is no reason why
> this can't be avoided, the time just hasn't been taken to make those changes.
> We'd happily accept a PR which makes the appropriate changes!

This directory contains .js and .d.ts files. The index files are written
manually and the files in `generated` are automatically generated with
`@apollo/protobufjs` (a fork of
[`protobufjs`](https://www.npmjs.com/package/protobufjs) that we maintain
specifically for this package) based on the `reports.proto` file. None of these
files are generated from .ts files by tsc, which is why this directory is not
under `src`.

To update `reports.proto` to the current version recognized by the Studio usage
reporting ingress, run `npm run protobuf-update`. To then regenerate the JS and
TS files, run `npm run protobuf-generate`. We check in the generated code and only
regenerate it manually, partially to make builds faster (no need to run pbjs on
every `npm install`) and partially so that we don't have to make sure that
`pbjs` runs on every Node version that we support.

The files in this subdirectory are large, so we want to avoid loading them at
runtime unless necessary. Thus, files in this directory should only be imported
in three contexts:
- Inside `src/plugin`, in files that will only be loaded indirectly via the
  runtime require calls in `src/plugin/index.ts`
- In tests
- At compile-time only via `import type` calls
