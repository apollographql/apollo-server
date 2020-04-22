import './polyfills/Object.values';
import './polyfills/Object.entries';

import runtimeSupportsPromisify from './utils/runtimeSupportsPromisify';

if (!runtimeSupportsPromisify) {
  require('util.promisify').shim();
}

export * from './polyfills/fetch';
export * from './polyfills/url';
