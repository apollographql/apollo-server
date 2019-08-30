const { defaults } = require("jest-config");

module.exports = {
  rootDir: ".",
  testEnvironment: "node",
    preset: "ts-jest",
    testMatch: null,
    testRegex: "/__tests__/.*\\.test\\.(js|ts)$",
    testPathIgnorePatterns: [
      "/node_modules/",
      "/dist/"
    ],
    moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
    clearMocks: true,
    globals: {
      "ts-jest": {
        tsConfig: "<rootDir>/src/__tests__/tsconfig.json",
        diagnostics: false
      }
    }
};
