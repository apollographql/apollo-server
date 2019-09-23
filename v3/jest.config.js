module.exports = {
  displayName: "v3",
  testEnvironment: "node",
  preset: "ts-jest",
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/"
  ],
  clearMocks: true,
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/src/__tests__/tsconfig.json"
    }
  }
};
