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
      '^(?!apollo-server-env|apollo-engine-reporting-protobuf)(apollo-(?:server|datasource|cache-control|tracing|engine)[^/]*|graphql-extensions)(?:/dist)?((?:/.*)|$)': '<rootDir>/../../packages/$1/src$2'
    },
    clearMocks: true,
    globals: {
      "ts-jest": {
        tsConfig: "<rootDir>/tsconfig.test.json",
        diagnostics: false
      }
    }
};
