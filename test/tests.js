const NODE_VERSION = process.version.split('.');
const NODE_MAJOR_VERSION = parseInt(NODE_VERSION[0].replace(/\D/g, ''));

process.env.NODE_ENV = 'test';

require('../packages/graphql-server-core/src/runQuery.test');
require('../packages/graphql-server-module-operation-store/src/operationStore.test');
require('../packages/graphql-server-express/src/expressApollo.test');
require('../packages/graphql-server-express/src/connectApollo.test');
require('../packages/graphql-server-hapi/src/hapiApollo.test');
if (NODE_MAJOR_VERSION >= 6) {
    require('../packages/graphql-server-koa/src/koaApollo.test');
}
require('../packages/graphql-server-restify/src/restifyApollo.test');
require('../packages/graphql-server-lambda/src/lambdaApollo.test');
require('../packages/graphql-server-express/src/apolloServerHttp.test');
