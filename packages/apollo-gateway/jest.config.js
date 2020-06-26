const path = require('path');
const config = require('../../jest.config.base');

const NODE_MAJOR_VERSION = parseInt(
  process.versions.node.split('.', 1)[0],
  10
);

const additionalConfig = {
  setupFilesAfterEnv: [path.resolve(__dirname, './src/__tests__/testSetup.ts')],
  testPathIgnorePatterns: [
    ...config.testPathIgnorePatterns,
    ...NODE_MAJOR_VERSION < 12 ? ["<rootDir>"] : []
  ]
};

module.exports = Object.assign(Object.create(null), config, additionalConfig);
