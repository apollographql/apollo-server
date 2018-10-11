const { defaults } = require("jest-config");

const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig.base");

module.exports = {
  testEnvironment: "node",
    setupFiles: [
      "<rootDir>/../apollo-server-env/dist/index.js"
    ],
    preset: "ts-jest",
    testMatch: null,
    testRegex: "/__tests__/.*\\.test\\.(js|ts)$",
    testPathIgnorePatterns: [
      "/node_modules/",
      "/dist/"
    ],
    moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
    // FIXME: Specifying a `moduleNameMapper` based on the `paths` option
    // in `tsconfig.base.json` doesn't currently work because we only
    // want to use this for types and still import modules from `node_modules`
    // otherwise.
    // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
    clearMocks: true,
    globals: {
      "ts-jest": {
        tsConfig: "<rootDir>/tsconfig.test.json",
        diagnostics: false
      }
    }
};
