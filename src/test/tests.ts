/* tslint:disable */
// ensure support for promise

process.env.NODE_ENV = 'test';

declare function require(name: string);
require('source-map-support').install();

import '../core/runQuery.test';
import '../modules/operationStore.test';
import '../integrations/expressApollo.test';
import './testApolloServerHTTP';
