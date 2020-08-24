const config = require('../../jest.config.base');

const packageSpecificSetupFiles = ['<rootDir>/src/__tests__/jestSetup.ts'];

const setupFiles = (Array.isArray(config.setupFiles)
  ? config.setupFiles
  : []
).concat(packageSpecificSetupFiles);

module.exports = Object.assign(Object.create(null), config, { setupFiles });
