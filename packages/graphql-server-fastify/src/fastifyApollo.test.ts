import * as fastify from 'fastify';
import * as bodyParser from 'body-parser';
import { graphqlFastify, graphiqlFastify } from './fastifyApollo';
import testSuite, { schema as Schema, CreateAppOptions } from 'graphql-server-integration-testsuite';
import { expect } from 'chai';
import { GraphQLOptions } from 'graphql-server-core';
import 'mocha';

function createApp(options: CreateAppOptions = {}) {
  const app = fastify();

  options.graphqlOptions = options.graphqlOptions || { schema: Schema };
  if (!options.excludeParser) {
    app.use('/graphql', bodyParser.json());
  }
  if (options.graphiqlOptions ) {
    app.use('/graphiql', graphiqlFastify( options.graphiqlOptions ));
  }
  app.use('/graphql', graphqlFastify( options.graphqlOptions ));
  return app;
}

describe('fastifyApollo', () => {
  it('throws error if called without schema', function(){
     expect(() => graphqlFastify(undefined as GraphQLOptions)).to.throw('Apollo Server requires options.');
  });

  it('throws an error if called with more than one argument', function(){
     expect(() => (<any>graphqlFastify)({}, 'x')).to.throw(
       'Apollo Server expects exactly one argument, got 2');
  });
});

describe('integration:Fastify', () => {
  testSuite(createApp);
});
