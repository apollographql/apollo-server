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
    clearMocks: true,
    globals: {
      "ts-jest": {
        tsconfig: "<rootDir>/src/__tests__/tsconfig.json",
        diagnostics: false
      }
    }
};
