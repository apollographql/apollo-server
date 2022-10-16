import baseConfig from '../../jest.config.base.js';

// This needs to be "cloned" since jest depends on the object's identity in some
// way, whether it's via mutation or something else.
export default { ...baseConfig };
