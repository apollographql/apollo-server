const path = require('path');
const config = require('../../jest.config.base');

const additionalConfig = {
  setupFilesAfterEnv: [path.resolve(__dirname, './src/__tests__/testSetup.ts')],
};
module.exports = Object.assign(Object.create(null), additionalConfig, config);
