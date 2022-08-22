# Development

## Workflow

> When in doubt, reference the `scripts` in `package.json`.

To start development, simply run `npm install` (`npm i` for short). This will install and build the project.

To run Typescript in watch mode, run `npm run watch`.

If you have [Volta](https://docs.volta.sh/guide/getting-started) installed, your Node and NPM versions will be configured automatically for you.

## Testing

To run tests, run `npm test` (or `npm t` for short).

Arguments can be passed to the test command using the `--` like so: `npm t -- --watch` (this runs Jest in watch mode).
Similarly, you can run specific test files by name like so: `npm t -- ApolloServer.test.ts`.

Smoke tests run separately from Jest tests. They can be run with `npm run test:smoke`.

## Linting, Formatting, Spelling

ESLint can be run via `npm run lint`.
Prettier can be run via `npm run prettier-fix`.
Spell checking can be run via `npm run spell-check`. Words can be added to the dictionary: [`cspell-dict.txt`](./cspell-dict.txt) or ignore with the directive: `// cspell:ignore`.

Code formatting and spelling are enforced in CI, status checks will fail if these commands fail.

## Publishing

## Build System

Apollo Server is "dual-published", shipping with both ESM and CJS, and leverages deep imports. Combined with TypeScript, this introduces a fair amount of complexity into the build infrastructure of this repository. A few quirks to keep in mind while working in this project:

* Each dual-published package has 2 tsconfigs: one for ESM and one for CJS. These must also be referenced at the top-level in the respective esm/cjs-specific tsconfig files.
* Deep imports in the `@apollo/server` package must be listed within the package.json "exports" property. It's important to note that each "exports" entry properties must be specifically in the order: "types", "import", "require". [Typescript docs](https://www.typescriptlang.org/docs/handbook/esm-node.html#packagejson-exports-imports-and-self-referencing)
* Smoke tests to ensure proper builds and importability exist in the `smoke-test` directory. If new deep imports are added, they should be incorporated into the smoke tests.
