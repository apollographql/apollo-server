import { expect } from 'chai';
import 'mocha';

import * as request from 'request';
import { createApolloFetch } from 'apollo-fetch';

import { gql, ApolloServer } from './index';

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
      expect(() => new ApolloServer({ typeDefs, resolvers })).not.to.throw;
    });

    it('accepts typeDefs and mocks', () => {
      expect(() => new ApolloServer({ typeDefs, mocks: true })).not.to.throw;
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

      expect(result.data).to.deep.equal({ hello: 'hi' });
      expect(result.errors, 'errors should exist').not.to.exist;
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
              expect(body).to.contain('GraphQLPlayground');
              expect(response.statusCode).to.equal(200);
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
          ).to.equal('*');
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
          ).to.equal('localhost');
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
              expect(body).to.equal(JSON.stringify({ status: 'pass' }));
              expect(response.statusCode).to.equal(200);
              resolve();
            }
          },
        );
      });
    });
  });
});
