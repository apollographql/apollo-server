import 'mocha';
import testSuite, {
  schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { expect } from 'chai';
import { GraphQLOptions } from 'apollo-server-core';

let restify, graphiqlRestify, graphqlRestify;

function createApp(options: CreateAppOptions = {}) {
  const server = restify.createServer({
    name: 'Restify Test Server',
  });

  options.graphqlOptions = options.graphqlOptions || { schema };
  if (!options.excludeParser) {
    server.use(restify.plugins.bodyParser());
    server.use(restify.plugins.queryParser());
  }

  if (options.graphiqlOptions) {
    server.get('/graphiql', graphiqlRestify(options.graphiqlOptions));
  }

  server.get('/graphql', graphqlRestify(options.graphqlOptions));
  server.post('/graphql', graphqlRestify(options.graphqlOptions));

  return server;
}

describe('graphqlRestify', () => {
  // As was reported in https://github.com/apollographql/apollo-server/pull/921,
  // Restify monkey-patches Node internals, which can have adverse affects on
  // other environmental participants like Express.  Therefore, restify is being
  // dynamically loaded, rather than imported at top-level.
  before(async () => {
    const restifyApollo = await import('./restifyApollo');

    restify = await import('restify');

    graphqlRestify = restifyApollo.graphqlRestify;
    graphiqlRestify = restifyApollo.graphiqlRestify;
  });

  it('throws error if called without schema', () => {
    expect(() => graphqlRestify(undefined as GraphQLOptions)).to.throw(
      'Apollo Server requires options.',
    );
  });

  it('throws an error if called with more than one argument', () => {
    expect(() => (<any>graphqlRestify)({}, 'x')).to.throw(
      'Apollo Server expects exactly one argument, got 2',
    );
  });

  it('generates a function if the options are ok', () => {
    expect(() => graphqlRestify({ schema })).to.be.a('function');
  });
});

describe('integration:Restify', () => {
  testSuite(createApp);
});
