module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/"
  ],
  clearMocks: true,
};
