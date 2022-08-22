# Development

## Workflow

## Publishing

## Build System

Apollo Server is "dual-published", shipping with both ESM and CJS, and leverages deep imports. Combined with TypeScript, this introduces a fair amount of complexity into the build infrastructure of this repository. A few quirks to keep in mind while working in this project:

* Each dual-published package has 2 tsconfigs: one for ESM and one for CJS. These must also be referenced at the top-level in the respective esm/cjs-specific tsconfig files.
* Deep imports in the `@apollo/server` package must be listed within the package.json "exports" property. It's important to note that each "exports" entry properties must be specifically in the order: "types", "import", "require". [Typescript docs](https://www.typescriptlang.org/docs/handbook/esm-node.html#packagejson-exports-imports-and-self-referencing)
* Smoke tests to ensure proper builds and importability exist in the `smoke-test` directory. If new deep imports are added, they should be incorporated into the smoke tests.
