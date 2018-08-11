import './polyfills/Object.values';
import './polyfills/Object.entries';

require('util.promisify').shim();

export * from './polyfills/fetch';
export * from './polyfills/url';
