const { defaults } = require("jest-config");

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
    moduleNameMapper: {
      '^__mocks__/(.*)$': '<rootDir>/../../__mocks__/$1',
      // This regex should match the packages that we want compiled from source
      // through `ts-jest`, as opposed to loaded from their output files in
      // `dist`.
      // We don't want to match `apollo-server-env` and
      // `apollo-reporting-protobuf`, because these don't depend on
      // compilation but need to be initialized from as parto of `prepare`.
      '^(?!apollo-server-env|apollo-reporting-protobuf)(apollo-(?:server|datasource|cache-control|tracing)[^/]*|graphql-extensions)(?:/dist)?((?:/.*)|$)': '<rootDir>/../../packages/$1/src$2'
    },
    clearMocks: true,
    globals: {
      "ts-jest": {
        tsconfig: "<rootDir>/src/__tests__/tsconfig.json",
        diagnostics: false
      }
    }
};
