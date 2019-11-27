const config = require('../../jest.config.base');

module.exports = Object.assign(Object.create(null), config, {
  setupFiles: [
    'core-js/features/array/flat',
    'core-js/features/array/flat-map',
  ],
});
