import express from 'express';
import request from 'supertest';
import { ApolloServer, ApolloServerExpressConfig } from '../ApolloServer';
import { graphqlExpress, ExpressGraphQLOptions } from '../expressApollo';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';

function createApp(options: CreateAppOptions = {}) {
  const app = express();

  const server = new ApolloServer(
    (options.graphqlOptions as ApolloServerExpressConfig) || { schema: Schema },
  );
  server.applyMiddleware({ app });
  return app;
}

describe('expressApollo', () => {
  it('throws error if called without schema', function() {
    expect(() => new ApolloServer(undefined as ExpressGraphQLOptions)).toThrow(
      'ApolloServer requires options.',
    );
  });

  it('throws error if called with more than one argument', function() {
    expect(() => graphqlExpress({ schema: Schema }, 1)).toThrow(
      'Apollo Server expects exactly one argument, got 2',
    );
  });

  it("calls 'next' on query completion regardless of error state when callNext is set", async () => {
    const app = express();
    const mock = jest.fn();
    app.use('/graphiql', graphqlExpress({ callNext: false, schema: Schema }));
    app.use('/graphql', graphqlExpress({ callNext: true, schema: Schema }));
    app.use(mock);
    await request(app).get('/graphiql');
    expect(mock).not.toBeCalled();
    await request(app).get('/graphql');
    expect(mock).toBeCalled();
  });
});

describe('integration:Express', () => {
  testSuite(createApp);
});
