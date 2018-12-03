# apollo-engine-reporting-protobuf

This contains generated Javascript/TypeScript code for the protobuf definitions
for the Engine reporting API.

The Engine reporting API is currently subject to change at any time; do not rely
on this to build your own client.

## Development

Currently this package generates a majority of its code with
[`protobufjs`](https://www.npmjs.com/package/protobufjs) based on the
`reports.proto` file. The output is generated with the `prepare` command.
Normally `prepare` is performed by the root package.json with a `postinstall`
hook. If the code in this package needs to change, you should run `npx lerna
run prepare` in the root of this monorepo to generate the code changes. Running
the command in the root enables the `protobuf` binaries, `pbjs` and `pbts`, to
resolve correctly.
