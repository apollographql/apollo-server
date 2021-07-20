import micro from 'micro';
import listen from 'test-listen';
import { createApolloFetch } from 'apollo-server-integration-testsuite';
import { Config, gql } from 'apollo-server-core';
import rp from 'request-promise';

import { ApolloServer } from '../ApolloServer';

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'hi',
  },
};

async function createServer(
  options: object = {},
  config: Config = {},
): Promise<any> {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    stopOnTerminationSignals: false,
    ...config,
  });
  await apolloServer.start();
  const service = micro(apolloServer.createHandler(options));
  const uri = await listen(service);
  return {
    service,
    uri,
  };
}

describe('apollo-server-micro', function () {
  describe('constructor', function () {
    it('should accepts typeDefs and resolvers', function () {
      const apolloServer = new ApolloServer({ typeDefs, resolvers });
      expect(apolloServer).toBeDefined();
    });
  });

  describe('#createHandler', function () {
    describe('querying', function () {
      it(
        'should be queryable using the default /graphql path, if no path ' +
          'is provided',
        async function () {
          const { service, uri } = await createServer();
          const apolloFetch = createApolloFetch({ uri: `${uri}/graphql` });
          const result = await apolloFetch({ query: '{hello}' });
          expect(result.data.hello).toEqual('hi');
          service.close();
        },
      );

      it(
        'should only be queryable at the default /graphql path, if no path ' +
          'is provided',
        async function () {
          const { service, uri } = await createServer();
          const apolloFetch = createApolloFetch({ uri: `${uri}/nopath` });
          let errorThrown = false;
          try {
            await apolloFetch({ query: '{hello}' });
          } catch (error) {
            errorThrown = true;
          }
          expect(errorThrown).toBe(true);
          service.close();
        },
      );

      it('should be queryable using a custom path', async function () {
        const { service, uri } = await createServer({ path: '/data' });
        const apolloFetch = createApolloFetch({ uri: `${uri}/data` });
        const result = await apolloFetch({ query: '{hello}' });
        expect(result.data.hello).toEqual('hi');
        service.close();
      });

      it('should render a landing page when a browser sends in a request', async function () {
        const { service, uri } = await createServer(
          {},
          { __testing_nodeEnv__: undefined },
        );

        const body = await rp({
          uri: `${uri}/graphql`,
          method: 'GET',
          headers: {
            accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          },
        });
        expect(body).toMatch(
          /apollo-server-landing-page.cdn.apollographql.com\/_latest/,
        );
        service.close();
      });
    });

    describe('health checks', function () {
      it('should create a healthcheck endpoint', async function () {
        const { service, uri } = await createServer();
        const body = await rp(`${uri}/.well-known/apollo/server-health`);
        expect(body).toEqual(JSON.stringify({ status: 'pass' }));
        service.close();
      });

      it('should support a health check callback', async function () {
        const { service, uri } = await createServer({
          async onHealthCheck() {
            throw Error("can't connect to DB");
          },
        });

        let error;
        try {
          await rp(`${uri}/.well-known/apollo/server-health`);
        } catch (err) {
          error = err;
        }
        expect(error).toBeDefined();
        expect(error.statusCode).toEqual(503);
        expect(error.error).toEqual(JSON.stringify({ status: 'fail' }));
        service.close();
      });

      it('should be able to disable the health check', async function () {
        const { service, uri } = await createServer({
          disableHealthCheck: true,
        });

        let error;
        try {
          await rp(`${uri}/.well-known/apollo/server-health`);
        } catch (err) {
          error = err;
        }
        expect(error).toBeDefined();
        expect(error.statusCode).toEqual(404);
        service.close();
      });
    });
  });
});
