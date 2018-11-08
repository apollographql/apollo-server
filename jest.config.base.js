const { defaults } = require("jest-config");

const testPathIgnorePatterns = [
  "/node_modules/",
  "/dist/"
];

const NODE_MAJOR_VERSION = parseInt(process.versions.node.split('.', 1)[0], 10);

if (NODE_MAJOR_VERSION < 8) {
  testPathIgnorePatterns.push("/packages/apollo-server-adonis")
}

module.exports = {
  testEnvironment: "node",
    setupFiles: [
      "<rootDir>/../apollo-server-env/dist/index.js"
    ],
    preset: "ts-jest",
    testMatch: null,
    testRegex: "/__tests__/.*\\.test\\.(js|ts)$",
    testPathIgnorePatterns,
    moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
    moduleNameMapper: {
      '^__mocks__/(.*)$': '<rootDir>/../../__mocks__/$1',
      // This regex should match the packages that we want compiled from source
      // through `ts-jest`, as opposed to loaded from their output files in
      // `dist`.
      // We don't want to match `apollo-server-env` and
      // `apollo-engine-reporting-protobuf`, because these don't depend on
      // compilation but need to be initialized from as parto of `prepare`.
      '^(?!apollo-server-env|apollo-engine-reporting-protobuf)(apollo-(?:server|datasource|cache-control|tracing|engine)[^/]*|graphql-extensions)(?:/dist)?((?:/.*)|$)': '<rootDir>/../../packages/$1/src$2'
    },
    clearMocks: true,
    globals: {
      "ts-jest": {
        tsConfig: "<rootDir>/src/__tests__/tsconfig.json",
        diagnostics: false
      }
    }
};
