const { defaults } = require("jest-config");

module.exports = {
  testEnvironment: "node",
    preset: "ts-jest",
    testPathIgnorePatterns: [
      "/node_modules/",
      "/dist/"
    ],
    clearMocks: true,
};
