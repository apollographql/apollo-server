import * as express from 'express';
import * as bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from './expressApollo';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { expect } from 'chai';
import { GraphQLOptions } from 'apollo-server-core';
import 'mocha';

function createApp(options: CreateAppOptions = {}) {
  const app = express();

  options.graphqlOptions = options.graphqlOptions || { schema: Schema };
  if (!options.excludeParser) {
    app.use('/graphql', bodyParser.json());
  }
  if (options.graphiqlOptions) {
    app.use('/graphiql', graphiqlExpress(options.graphiqlOptions));
  }
  app.use('/graphql', require('connect-query')());
  app.use('/graphql', graphqlExpress(options.graphqlOptions));
  return app;
}

describe('expressApollo', () => {
  it('throws error if called without schema', function() {
    expect(() => graphqlExpress(undefined as GraphQLOptions)).to.throw(
      'Apollo Server requires options.',
    );
  });

  it('throws an error if called with more than one argument', function() {
    expect(() => (<any>graphqlExpress)({}, 'x')).to.throw(
      'Apollo Server expects exactly one argument, got 2',
    );
  });
});

describe('integration:Express', () => {
  testSuite(createApp);
});
