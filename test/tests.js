const NODE_VERSION = process.version.split('.');
const NODE_MAJOR_VERSION = parseInt(NODE_VERSION[0].replace(/^v/, ''));
const NODE_MAJOR_REVISION = parseInt(NODE_VERSION[1]);
process.env.NODE_ENV = 'test';

process.on('unhandledRejection', reason => {
  console.log('Reason: ' + reason);
  console.log('Stack: ' + reason.stack);
});

//apollo-server-core
require('../packages/apollo-server-core/dist/runQuery.test.js');
require('../packages/apollo-server-core/dist/runHttpQuery.test.js');
require('../packages/apollo-server-core/dist/errors.test.js');

//Apollo server 2 tests

//apollo-server
require('../packages/apollo-server/dist/index.test.js');

require('../packages/apollo-server-express/dist/ApolloServer.test.js');
require('../packages/apollo-server-express/dist/expressApollo.test');
require('../packages/apollo-server-express/dist/connectApollo.test');
require('../packages/apollo-server-express/dist/datasource.test');

(NODE_MAJOR_VERSION >= 9 ||
  (NODE_MAJOR_VERSION >= 8 && NODE_MAJOR_REVISION >= 9)) &&
require('../packages/apollo-server-hapi/dist/hapiApollo.test') && // Hapi 17 is 8.9+
  require('../packages/apollo-server-hapi/dist/ApolloServer.test.js');
require('../packages/apollo-server-express/dist/apolloServerHttp.test');

require('../packages/apollo-server-lambda/dist/lambdaApollo.test');
