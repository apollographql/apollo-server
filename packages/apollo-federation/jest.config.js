const config = require('../../jest.config.base');

const NODE_MAJOR_VERSION = parseInt(
  process.versions.node.split('.', 1)[0],
  10
);

const additionalConfig = {
  setupFiles: [
    'core-js/features/array/flat',
    'core-js/features/array/flat-map',
  ],
  testPathIgnorePatterns: [
    ...config.testPathIgnorePatterns,
    ...NODE_MAJOR_VERSION === 6 ? ["<rootDir>"] : []
  ]
};

module.exports = Object.assign(Object.create(null), config, additionalConfig);
