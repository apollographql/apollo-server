import {
  assert,
  expect,
} from 'chai';

// TODO use import, not require... help appreciated.
import * as express from 'express';
import * as bodyParser from 'body-parser';
import ApolloOptions from './apolloOptions';
import { graphqlHTTP, renderGraphiQL } from './expressApollo';

import testSuite, { Schema, CreateAppOptions } from './integrations.test';

function createApp(options: CreateAppOptions = {}) {
  const app = express();

  options.apolloOptions = options.apolloOptions || { schema: Schema };
  if (!options.excludeParser) {
    app.use('/graphql', bodyParser.json());
  }
  if (options.graphiqlOptions ) {
    app.use('/graphiql', renderGraphiQL( options.graphiqlOptions ));
  }
  app.use('/graphql', graphqlHTTP( options.apolloOptions ));
  return app;
}

describe('graphqlHTTP', () => {
   it('returns express middleware', () => {
      const middleware = graphqlHTTP({
          schema: Schema,
      });
      assert.typeOf(middleware, 'function');
  });
  it('throws error if called without schema', () => {
     expect(() => graphqlHTTP(undefined as ApolloOptions)).to.throw('Apollo Server requires options.');
  });
});

describe('renderGraphiQL', () => {
  it('returns express middleware', () => {
      const query = `{ testString }`;
      const middleware = renderGraphiQL({
          endpointURL: '/graphql',
          query: query,
      });
      assert.typeOf(middleware, 'function');
  });
});

testSuite(createApp);
