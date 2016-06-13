/* tslint:disable */
// ensure support for promise
import 'es6-promise';

process.env.NODE_ENV = 'test';

declare function require(name: string);
require('source-map-support').install();

import '../core/runQuery.test';
import '../bindings/express/expressApollo.test';
