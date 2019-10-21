module.exports = {
  displayName: "v3",
  testEnvironment: "node",
  preset: "ts-jest",
  roots: ["./src/"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/"
  ],
  clearMocks: true,
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.test.json"
    }
  }
};
