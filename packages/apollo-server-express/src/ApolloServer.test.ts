import { expect } from 'chai';
import { stub } from 'sinon';
import 'mocha';
import * as express from 'express';

import * as request from 'request';
import { createApolloFetch } from 'apollo-fetch';

import { gql, ApolloServer } from 'apollo-server';
import { registerServer } from './ApolloServer';

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

describe('apollo-server-express', () => {
  describe('', () => {
    it('accepts typeDefs and resolvers', () => {
      const app = express();
      const server = new ApolloServer({ typeDefs, resolvers });
      expect(() => registerServer({ app, server })).not.to.throw;
    });

    it('accepts typeDefs and mocks', () => {
      const app = express();
      const server = new ApolloServer({ typeDefs, resolvers });
      expect(() => registerServer({ app, server })).not.to.throw;
    });
  });

  describe('registerServer', () => {
    let server: ApolloServer;
    let app: express.Application;
    afterEach(async () => {
      await server.stop();
    });

    it('can be queried', async () => {
      server = new ApolloServer({
        typeDefs,
        resolvers,
      });
      app = express();

      registerServer({ app, server });

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
      app = express();

      registerServer({ app, server });

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

    it('accepts cors configuration', async () => {
      server = new ApolloServer({
        typeDefs,
        resolvers,
      });
      app = express();

      registerServer({ app, server, cors: { origin: 'apollographql.com' } });

      const { url: uri } = await server.listen({});

      const apolloFetch = createApolloFetch({ uri }).useAfter(
        (response, next) => {
          expect(
            response.response.headers.get('access-control-allow-origin'),
          ).to.equal('apollographql.com');
          next();
        },
      );
      await apolloFetch({ query: '{hello}' });
    });

    it('accepts body parser configuration', async () => {
      server = new ApolloServer({
        typeDefs,
        resolvers,
      });
      app = express();

      registerServer({ app, server, bodyParserConfig: { limit: 0 } });

      const { url: uri } = await server.listen({});

      const apolloFetch = createApolloFetch({ uri });

      return new Promise((resolve, reject) => {
        apolloFetch({ query: '{hello}' })
          .then(reject)
          .catch(error => {
            expect(error.response).to.exist;
            expect(error.response.status).to.equal(413);
            expect(error.toString()).to.contain('Payload Too Large');
            resolve();
          });
      });
    });

    describe('healthchecks', () => {
      let server: ApolloServer;

      afterEach(async () => {
        await server.stop();
      });

      it('creates a healthcheck endpoint', async () => {
        server = new ApolloServer({
          typeDefs,
          resolvers,
        });
        app = express();

        registerServer({ app, server, bodyParserConfig: { limit: 0 } });

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

      it('provides a callback for the healthcheck', async () => {
        server = new ApolloServer({
          typeDefs,
          resolvers,
        });
        app = express();

        registerServer({
          app,
          server,
          onHealthCheck: async () => {
            throw Error("can't connect to DB");
          },
        });

        const { port } = await server.listen({});

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
                expect(body).to.equal(JSON.stringify({ status: 'fail' }));
                expect(response.statusCode).to.equal(503);
                resolve();
              }
            },
          );
        });
      });

      it('can disable the healthCheck', async () => {
        server = new ApolloServer({
          typeDefs,
          resolvers,
        });
        app = express();
        registerServer({
          app,
          server,
          disableHealthCheck: true,
        });

        const { port } = await server.listen({});

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
                expect(response.statusCode).to.equal(404);
                resolve();
              }
            },
          );
        });
      });
    });
  });
});
