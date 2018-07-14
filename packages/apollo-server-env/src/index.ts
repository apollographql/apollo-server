import './polyfills/Object.values';

require('util.promisify').shim();

export * from './polyfills/fetch';
export * from './polyfills/url';
