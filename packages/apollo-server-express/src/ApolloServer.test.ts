import { expect } from 'chai';
import 'mocha';
import * as express from 'express';

import * as request from 'request';
import * as FormData from 'form-data';
import * as fs from 'fs';
import fetch from 'node-fetch';
import { createApolloFetch } from 'apollo-fetch';

import { ApolloServerBase, AuthenticationError } from 'apollo-server-core';
import { registerServer } from './ApolloServer';

//to remove the circular dependency, we reference it directly
const gql = require('../../apollo-server/dist/index').gql;

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
  //to remove the circular dependency, we reference it directly
  const ApolloServer = require('../../apollo-server/dist/index').ApolloServer;
  let server: ApolloServerBase<express.Request>;
  let app: express.Application;

  afterEach(async () => {
    if (server) await server.stop();
  });

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
      let server: ApolloServerBase<express.Request>;

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
            (error, response) => {
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
    describe('file uploads', () => {
      it('enabled uploads', async () => {
        server = new ApolloServer({
          typeDefs: gql`
            type File {
              filename: String!
              mimetype: String!
              encoding: String!
            }

            type Query {
              uploads: [File]
            }

            type Mutation {
              singleUpload(file: Upload!): File!
            }
          `,
          resolvers: {
            Query: {
              uploads: () => {},
            },
            Mutation: {
              singleUpload: async (_, args) => {
                expect((await args.file).stream).to.exist;
                return args.file;
              },
            },
          },
        });
        app = express();
        registerServer({
          app,
          server,
        });

        const { port } = await server.listen({});

        const body = new FormData();

        body.append(
          'operations',
          JSON.stringify({
            query: `
              mutation($file: Upload!) {
                singleUpload(file: $file) {
                  filename
                  encoding
                  mimetype
                }
              }
            `,
            variables: {
              file: null,
            },
          }),
        );

        body.append('map', JSON.stringify({ 1: ['variables.file'] }));
        body.append('1', fs.createReadStream('package.json'));

        try {
          const resolved = await fetch(`http://localhost:${port}/graphql`, {
            method: 'POST',
            body,
          });
          const response = await resolved.json();

          expect(response.data.singleUpload).to.deep.equal({
            filename: 'package.json',
            encoding: '7bit',
            mimetype: 'application/json',
          });
        } catch (error) {
          // This error began appearing randomly and seems to be a dev dependency bug.
          // https://github.com/jaydenseric/apollo-upload-server/blob/18ecdbc7a1f8b69ad51b4affbd986400033303d4/test.js#L39-L42
          if (error.code !== 'EPIPE') throw error;
        }
      });
    });

    describe('errors', () => {
      it('returns thrown context error as a valid graphql result', async () => {
        const nodeEnv = process.env.NODE_ENV;
        delete process.env.NODE_ENV;
        const typeDefs = gql`
          type Query {
            hello: String
          }
        `;
        const resolvers = {
          Query: {
            hello: () => {
              throw Error('never get here');
            },
          },
        };
        server = new ApolloServer({
          typeDefs,
          resolvers,
          context: () => {
            throw new AuthenticationError('valid result');
          },
        });

        app = express();
        registerServer({ app, server });

        const { url: uri } = await server.listen();
        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: '{hello}' });
        expect(result.errors.length).to.equal(1);
        expect(result.data).not.to.exist;

        const e = result.errors[0];
        expect(e.message).to.contain('valid result');
        expect(e.extensions).to.exist;
        expect(e.extensions.code).to.equal('UNAUTHENTICATED');
        expect(e.extensions.exception.stacktrace).to.exist;

        process.env.NODE_ENV = nodeEnv;
      });

      it('propogates error codes in dev mode', async () => {
        const nodeEnv = process.env.NODE_ENV;
        delete process.env.NODE_ENV;

        server = new ApolloServer({
          typeDefs: gql`
            type Query {
              error: String
            }
          `,
          resolvers: {
            Query: {
              error: () => {
                throw new AuthenticationError('we the best music');
              },
            },
          },
        });

        app = express();
        registerServer({ app, server });

        const { url: uri } = await server.listen();
        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{error}` });
        expect(result.data).to.exist;
        expect(result.data).to.deep.equal({ error: null });

        expect(result.errors, 'errors should exist').to.exist;
        expect(result.errors.length).to.equal(1);
        expect(result.errors[0].extensions.code).to.equal('UNAUTHENTICATED');
        expect(result.errors[0].extensions.exception).to.exist;
        expect(result.errors[0].extensions.exception.stacktrace).to.exist;

        process.env.NODE_ENV = nodeEnv;
      });

      it('propogates error codes in production', async () => {
        const nodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        server = new ApolloServer({
          typeDefs: gql`
            type Query {
              error: String
            }
          `,
          resolvers: {
            Query: {
              error: () => {
                throw new AuthenticationError('we the best music');
              },
            },
          },
        });

        app = express();
        registerServer({ app, server });

        const { url: uri } = await server.listen();
        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{error}` });
        expect(result.data).to.exist;
        expect(result.data).to.deep.equal({ error: null });

        expect(result.errors, 'errors should exist').to.exist;
        expect(result.errors.length).to.equal(1);
        expect(result.errors[0].extensions.code).to.equal('UNAUTHENTICATED');
        expect(result.errors[0].extensions.exception).not.to.exist;

        process.env.NODE_ENV = nodeEnv;
      });

      it('propogates error codes with null response in production', async () => {
        const nodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        server = new ApolloServer({
          typeDefs: gql`
            type Query {
              error: String!
            }
          `,
          resolvers: {
            Query: {
              error: () => {
                throw new AuthenticationError('we the best music');
              },
            },
          },
        });

        app = express();
        registerServer({ app, server });

        const { url: uri } = await server.listen();
        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{error}` });
        expect(result.data).null;

        expect(result.errors, 'errors should exist').to.exist;
        expect(result.errors.length).to.equal(1);
        expect(result.errors[0].extensions.code).to.equal('UNAUTHENTICATED');
        expect(result.errors[0].extensions.exception).not.to.exist;

        process.env.NODE_ENV = nodeEnv;
      });
    });
  });
});
