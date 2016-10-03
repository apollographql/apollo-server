/* tslint:disable */
require('babel-polyfill');

process.env.NODE_ENV = 'test';

require('source-map-support').install();
require('../packages/apollo-server-core/dist/runQuery.test.js');
require('../packages/apollo-server-operation-store/dist/operationStore.test');
require('../packages/apollo-server-express/dist/expressApollo.test');
require('../packages/apollo-server-express/dist/connectApollo.test');
require('../packages/apollo-server-hapi/dist/hapiApollo.test');
require('../packages/apollo-server-koa/dist/koaApollo.test');
require('../packages/apollo-server-express/dist/apolloServerHttp.test');
