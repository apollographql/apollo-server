const NODE_VERSION = process.version.split('.');
const NODE_MAJOR_VERSION = parseInt(NODE_VERSION[0].replace(/^v/, ''));
process.env.NODE_ENV = 'test';

require('../packages/apollo-server-core/dist/runQuery.test.js');
require('../packages/apollo-server-module-operation-store/dist/operationStore.test');
(NODE_MAJOR_VERSION >= 7) && require('../packages/apollo-server-adonis/dist/adonisApollo.test');
require('../packages/apollo-server-express/dist/expressApollo.test');
require('../packages/apollo-server-express/dist/connectApollo.test');
require('../packages/apollo-server-hapi/dist/hapiApollo.test');
(NODE_MAJOR_VERSION >= 6) && require('../packages/apollo-server-micro/dist/microApollo.test');
(NODE_MAJOR_VERSION >= 7) && require('../packages/apollo-server-koa/dist/koaApollo.test');
require('../packages/apollo-server-lambda/dist/lambdaApollo.test');
require('../packages/apollo-server-azure-functions/dist/azureFunctionsApollo.test');
require('../packages/apollo-server-express/dist/apolloServerHttp.test');

// XXX: Running restify last as it breaks http.
// for more info: https://github.com/restify/node-restify/issues/700
require('../packages/apollo-server-restify/dist/restifyApollo.test');
