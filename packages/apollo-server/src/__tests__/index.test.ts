import request from 'request';
import { createApolloFetch } from 'apollo-fetch';

import { gql, ApolloServer } from '../index';

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

describe('apollo-server', () => {
  describe('constructor', () => {
    it('accepts typeDefs and resolvers', () => {
      expect(() => new ApolloServer({ typeDefs, resolvers })).not.toThrow;
    });

    it('accepts typeDefs and mocks', () => {
      expect(() => new ApolloServer({ typeDefs, mocks: true })).not.toThrow;
    });

    // These tests are duplicates of ones in apollo-server-integration-testsuite
    // We don't actually expect Jest to do much here, the purpose of these
    // tests is to make sure our typings are correct, and to trigger a
    // compile error if they aren't
    describe('context field', () => {
      describe('as a function', () => {
        it('can accept and return `req`', () => {
          expect(
            new ApolloServer({
              typeDefs,
              resolvers,
              context: ({ req }) => ({ req }),
            }),
          ).not.toThrow;
        });

        it('can accept nothing and return an empty object', () => {
          expect(
            new ApolloServer({
              typeDefs,
              resolvers,
              context: () => ({}),
            }),
          ).not.toThrow;
        });
      });
    });
    describe('as an object', () => {
      it('can be an empty object', () => {
        expect(
          new ApolloServer({
            typeDefs,
            resolvers,
            context: {},
          }),
        ).not.toThrow;
      });

      it('can contain arbitrary values', () => {
        expect(
          new ApolloServer({
            typeDefs,
            resolvers,
            context: { value: 'arbitrary' },
          }),
        ).not.toThrow;
      });
    });
  });

  describe('without registerServer', () => {
    let server: ApolloServer;
    afterEach(async () => {
      await server.stop();
    });

    it('can be queried', async () => {
      server = new ApolloServer({
        typeDefs,
        resolvers,
      });

      const { url: uri } = await server.listen();
      const apolloFetch = createApolloFetch({ uri });
      const result = await apolloFetch({ query: '{hello}' });

      expect(result.data).toEqual({ hello: 'hi' });
      expect(result.errors).toBeUndefined();
    });

    it('renders GraphQL playground when browser requests', async () => {
      const nodeEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      server = new ApolloServer({
        typeDefs,
        resolvers,
      });

      const { url } = await server.listen();
      return new Promise((resolve, reject) => {
        request(
          {
            url,
            method: 'GET',
            headers: {
              accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            },
          },
          (error, response, body) => {
            process.env.NODE_ENV = nodeEnv;
            if (error) {
              reject(error);
            } else {
              expect(body).toMatch('GraphQLPlayground');
              expect(response.statusCode).toEqual(200);
              resolve();
            }
          },
        );
      });
    });

    it('configures cors', async () => {
      server = new ApolloServer({
        typeDefs,
        resolvers,
      });

      const { url: uri } = await server.listen();

      const apolloFetch = createApolloFetch({ uri }).useAfter(
        (response, next) => {
          expect(
            response.response.headers.get('access-control-allow-origin'),
          ).toEqual('*');
          next();
        },
      );
      await apolloFetch({ query: '{hello}' });
    });

    it('configures cors', async () => {
      server = new ApolloServer({
        typeDefs,
        resolvers,
        cors: { origin: 'localhost' },
      });

      const { url: uri } = await server.listen();

      const apolloFetch = createApolloFetch({ uri }).useAfter(
        (response, next) => {
          expect(
            response.response.headers.get('access-control-allow-origin'),
          ).toEqual('localhost');
          next();
        },
      );
      await apolloFetch({ query: '{hello}' });
    });

    it('creates a healthcheck endpoint', async () => {
      server = new ApolloServer({
        typeDefs,
        resolvers,
      });

      const { port } = await server.listen();
      return new Promise((resolve, reject) => {
        request(
          {
            url: `http://localhost:${port}/.well-known/apollo/server-health`,
            method: 'GET',
          },
          (error, response, body) => {
            if (error) {
              reject(error);
            } else {
              expect(body).toEqual(JSON.stringify({ status: 'pass' }));
              expect(response.statusCode).toEqual(200);
              resolve();
            }
          },
        );
      });
    });
  });
});
