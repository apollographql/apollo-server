import * as fastify from 'fastify';
import * as bodyParser from 'body-parser';
import { graphqlFastify, graphiqlFastify } from '../fastifyApollo';
import testSuite, { schema as Schema, CreateAppOptions } from 'graphql-server-integration-testsuite';
import { GraphQLOptions } from 'graphql-server-core';

function createApp(options: CreateAppOptions = {}) {
  const app = fastify();

  options.graphqlOptions = options.graphqlOptions || { schema: Schema };
  if (!options.excludeParser) {
    app.use('/graphql', bodyParser.json());
  }
  app.use('/graphiql', graphiqlFastify({endpointURL: '/graphql'}));
  app.use('/graphql', graphqlFastify(options.graphqlOptions));
  return app;
}

const app = createApp();

app.listen(3000, function (err) {
  if (err) {
    throw err;
  }

  // tslint:disable
  console.log(`server listening on ${app.server.address().port}`);
});
