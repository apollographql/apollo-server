import * as restify from 'restify';
import { apolloRestify, graphiqlRestify } from './restifyApollo';
import testSuite, { Schema, CreateAppOptions } from './integrations.test';
import { expect } from 'chai';
import ApolloOptions from './apolloOptions';

function createApp(options: CreateAppOptions = {}) {
  const server = restify.createServer({
    name: 'GraphQL Demo',
  });

  options.apolloOptions = options.apolloOptions || { schema: Schema };
  if (!options.excludeParser) {
    server.use(restify.bodyParser());
  }

  if (options.graphiqlOptions ) {
    server.get('/graphiql', graphiqlRestify( options.graphiqlOptions ));
  }

  server.post('/graphql', apolloRestify( options.apolloOptions ));

  return server;
}

describe('restifyApollo', () => {
  it('throws error if called without schema', function(){
     expect(() => apolloRestify(undefined as ApolloOptions)).to.throw('Apollo Server requires options.');
  });

  it('throws an error if called with more than one argument', function(){
     expect(() => (<any>apolloRestify)({}, 'x')).to.throw(
       'Apollo Server expects exactly one argument, got 2');
  });
});

describe('integration:Restify', () => {
  testSuite(createApp);
});
