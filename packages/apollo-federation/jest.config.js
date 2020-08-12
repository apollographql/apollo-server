const config = require('../../jest.config.base');

const additionalConfig = {
  setupFiles: [
    'core-js/features/array/flat',
    'core-js/features/array/flat-map',
  ],
  testPathIgnorePatterns: [
    ...config.testPathIgnorePatterns,
  ]
};

module.exports = Object.assign(Object.create(null), config, additionalConfig);
