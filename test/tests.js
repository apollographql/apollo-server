const NODE_VERSION = process.version.split('.');
const NODE_MAJOR_VERSION = parseInt(NODE_VERSION[0].replace(/^v/, ''));
process.env.NODE_ENV = 'test';

require('../packages/graphql-server-core/dist/runQuery.test.js');
require('../packages/graphql-server-module-operation-store/dist/operationStore.test');
require('../packages/graphql-server-express/dist/expressApollo.test');
require('../packages/graphql-server-express/dist/connectApollo.test');
require('../packages/graphql-server-hapi/dist/hapiApollo.test');
if (NODE_MAJOR_VERSION >= 6) {
    require('../packages/graphql-server-koa/dist/koaApollo.test');
    require('../packages/graphql-server-micro/dist/microApollo.test');
}
require('../packages/graphql-server-restify/dist/restifyApollo.test');
require('../packages/graphql-server-lambda/dist/lambdaApollo.test');
require('../packages/graphql-server-express/dist/apolloServerHttp.test');
