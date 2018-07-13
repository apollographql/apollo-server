import { expect } from 'chai';
import 'mocha';
import * as express from 'express';

import * as http from 'http';

import * as request from 'request';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { createApolloFetch } from 'apollo-fetch';

import { gql, AuthenticationError, Config } from 'apollo-server-core';
import { ApolloServer, ServerRegistration } from './ApolloServer';

import {
  testApolloServer,
  createServerInfo,
} from 'apollo-server-integration-testsuite';

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
  let server;
  let httpServer;
  testApolloServer(
    async options => {
      server = new ApolloServer(options);
      const app = express();
      server.applyMiddleware({ app });
      httpServer = await new Promise<http.Server>(resolve => {
        const s = app.listen({ port: 4000 }, () => resolve(s));
      });
      return createServerInfo(server, httpServer);
    },
    async () => {
      if (server) await server.stop();
      if (httpServer && httpServer.listening) await httpServer.close();
    },
  );
});

describe('apollo-server-express', () => {
  let server: ApolloServer;

  let app: express.Application;
  let httpServer: http.Server;

  async function createServer(
    serverOptions: Config,
    options: Partial<ServerRegistration> = {},
  ) {
    server = new ApolloServer(serverOptions);
    app = express();

    server.applyMiddleware({ ...options, app });

    httpServer = await new Promise<http.Server>(resolve => {
      const l = app.listen({ port: 4000 }, () => resolve(l));
    });

    return createServerInfo(server, httpServer);
  }

  afterEach(async () => {
    if (server) await server.stop();
    if (httpServer) await httpServer.close();
  });

  describe('constructor', () => {
    it('accepts typeDefs and resolvers', () => {
      return createServer({ typeDefs, resolvers });
    });
  });

  describe('applyMiddleware', () => {
    it('can be queried', async () => {
      const { url: uri } = await createServer({
        typeDefs,
        resolvers,
      });
      const apolloFetch = createApolloFetch({ uri });
      const result = await apolloFetch({ query: '{hello}' });

      expect(result.data).to.deep.equal({ hello: 'hi' });
      expect(result.errors, 'errors should exist').not.to.exist;
    });

    // XXX Unclear why this would be something somebody would want (vs enabling
    // introspection without graphql-playground, which seems reasonable, eg you
    // have your own graphql-playground setup with a custom link)
    it('can enable playground separately from introspection during production', async () => {
      const INTROSPECTION_QUERY = `
  {
    __schema {
      directives {
        name
      }
    }
  }
`;

      const { url: uri } = await createServer({
        typeDefs,
        resolvers,
        introspection: false,
      });

      const apolloFetch = createApolloFetch({ uri });
      const result = await apolloFetch({ query: INTROSPECTION_QUERY });

      expect(result.errors.length).to.equal(1);
      expect(result.errors[0].extensions.code).to.equal(
        'GRAPHQL_VALIDATION_FAILED',
      );

      return new Promise<http.Server>((resolve, reject) => {
        request(
          {
            url: uri,
            method: 'GET',
            headers: {
              accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            },
          },
          (error, response, body) => {
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

    it('renders GraphQL playground by default when browser requests', async () => {
      const nodeEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const { url } = await createServer({
        typeDefs,
        resolvers,
      });

      return new Promise<http.Server>((resolve, reject) => {
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

    it('accepts partial GraphQL Playground Options', async () => {
      const nodeEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const defaultQuery = 'query { foo { bar } }';
      const endpoint = '/fumanchupacabra';
      const { url } = await createServer(
        {
          typeDefs,
          resolvers,
          playground: {
            // https://github.com/apollographql/graphql-playground/blob/0e452d2005fcd26f10fbdcc4eed3b2e2af935e3a/packages/graphql-playground-html/src/render-playground-page.ts#L16-L24
            // must be made partial
            settings: {
              'editor.theme': 'light',
            } as any,
            tabs: [
              {
                query: defaultQuery,
              },
              {
                endpoint,
              } as any,
            ],
          },
        },
        {},
      );

      return new Promise<http.Server>((resolve, reject) => {
        request(
          {
            url,
            method: 'GET',
            headers: {
              accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
              Folo: 'bar',
            },
          },
          (error, response, body) => {
            process.env.NODE_ENV = nodeEnv;
            if (error) {
              reject(error);
            } else {
              console.log('body', body);
              expect(body).to.contain('GraphQLPlayground');
              expect(body).to.contain(`"editor.theme": "light"`);
              expect(body).to.contain(defaultQuery);
              expect(body).to.contain(endpoint);
              expect(response.statusCode).to.equal(200);
              resolve();
            }
          },
        );
      });
    });

    it('accepts playground options as a boolean', async () => {
      const nodeEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const { url } = await createServer(
        {
          typeDefs,
          resolvers,
          playground: false,
        },
        {},
      );

      return new Promise<http.Server>((resolve, reject) => {
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
              expect(body).not.to.contain('GraphQLPlayground');
              expect(response.statusCode).not.to.equal(200);
              resolve();
            }
          },
        );
      });
    });

    it('accepts cors configuration', async () => {
      const { url: uri } = await createServer(
        {
          typeDefs,
          resolvers,
        },
        {
          cors: { origin: 'apollographql.com' },
        },
      );

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
      const { url: uri } = await createServer(
        {
          typeDefs,
          resolvers,
        },
        {
          bodyParserConfig: { limit: 0 },
        },
      );

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
      afterEach(async () => {
        await server.stop();
      });

      it('creates a healthcheck endpoint', async () => {
        const { port } = await createServer({
          typeDefs,
          resolvers,
        });

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
        const { port } = await createServer(
          {
            typeDefs,
            resolvers,
          },
          {
            onHealthCheck: async () => {
              throw Error("can't connect to DB");
            },
          },
        );

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
        const { port } = await createServer(
          {
            typeDefs,
            resolvers,
          },
          {
            disableHealthCheck: true,
          },
        );

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
        // XXX This is currently a failing test for node 10
        const NODE_VERSION = process.version.split('.');
        const NODE_MAJOR_VERSION = parseInt(NODE_VERSION[0].replace(/^v/, ''));
        if (NODE_MAJOR_VERSION === 10) return;

        const { port } = await createServer({
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
            body: body as any,
          });
          const text = await resolved.text();
          const response = JSON.parse(text);

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
        const { url: uri } = await createServer({
          typeDefs,
          resolvers,
          context: () => {
            throw new AuthenticationError('valid result');
          },
        });

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

        const { url: uri } = await createServer({
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

        const { url: uri } = await createServer({
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

        const { url: uri } = await createServer({
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

  describe('extensions', () => {
    const books = [
      {
        title: 'H',
        author: 'J',
      },
    ];

    const typeDefs = gql`
      type Book {
        title: String
        author: String
      }

      type Cook @cacheControl(maxAge: 200) {
        title: String
        author: String
      }

      type Pook @cacheControl(maxAge: 200) {
        title: String
        books: [Book] @cacheControl(maxAge: 20, scope: PRIVATE)
      }

      type Query {
        books: [Book]
        cooks: [Cook]
        pooks: [Pook]
      }
    `;

    const resolvers = {
      Query: {
        books: () => books,
        cooks: () => books,
        pooks: () => [{ title: 'pook', books }],
      },
    };

    describe('Cache Control Headers', () => {
      it('applies cacheControl Headers and strips out extension', async () => {
        const { url: uri } = await createServer({ typeDefs, resolvers });

        const apolloFetch = createApolloFetch({ uri }).useAfter(
          (response, next) => {
            expect(response.response.headers.get('cache-control')).to.equal(
              'max-age=200, public',
            );
            next();
          },
        );
        const result = await apolloFetch({
          query: `{ cooks { title author } }`,
        });
        expect(result.data).to.deep.equal({ cooks: books });
        expect(result.extensions).not.to.exist;
      });

      it('contains no cacheControl Headers and keeps extension with engine proxy', async () => {
        const { url: uri } = await createServer({
          typeDefs,
          resolvers,
          cacheControl: true,
        });

        const apolloFetch = createApolloFetch({ uri }).useAfter(
          (response, next) => {
            expect(response.response.headers.get('cache-control')).not.to.exist;
            next();
          },
        );
        const result = await apolloFetch({
          query: `{ cooks { title author } }`,
        });
        expect(result.data).to.deep.equal({ cooks: books });
        expect(result.extensions).to.exist;
        expect(result.extensions.cacheControl).to.exist;
      });

      it('contains no cacheControl Headers when uncachable', async () => {
        const { url: uri } = await createServer({ typeDefs, resolvers });

        const apolloFetch = createApolloFetch({ uri }).useAfter(
          (response, next) => {
            expect(response.response.headers.get('cache-control')).not.to.exist;
            next();
          },
        );
        const result = await apolloFetch({
          query: `{ books { title author } }`,
        });
        expect(result.data).to.deep.equal({ books });
        expect(result.extensions).not.to.exist;
      });

      it('contains private cacheControl Headers when scoped', async () => {
        const { url: uri } = await createServer({ typeDefs, resolvers });

        const apolloFetch = createApolloFetch({ uri }).useAfter(
          (response, next) => {
            expect(response.response.headers.get('cache-control')).to.equal(
              'max-age=20, private',
            );
            next();
          },
        );
        const result = await apolloFetch({
          query: `{ pooks { title books { title author } } }`,
        });
        expect(result.data).to.deep.equal({
          pooks: [{ title: 'pook', books }],
        });
        expect(result.extensions).not.to.exist;
      });

      it('runs when cache-control is false', async () => {
        const { url: uri } = await createServer({
          typeDefs,
          resolvers,
          cacheControl: false,
        });

        const apolloFetch = createApolloFetch({ uri }).useAfter(
          (response, next) => {
            expect(response.response.headers.get('cache-control')).null;
            next();
          },
        );
        const result = await apolloFetch({
          query: `{ pooks { title books { title author } } }`,
        });
        expect(result.data).to.deep.equal({
          pooks: [{ title: 'pook', books }],
        });
        expect(result.extensions).not.to.exist;
      });
    });

    describe('Tracing', () => {
      const typeDefs = gql`
        type Book {
          title: String
          author: String
        }

        type Query {
          books: [Book]
        }
      `;

      const resolvers = {
        Query: {
          books: () => books,
        },
      };

      it('applies tracing extension', async () => {
        const { url: uri } = await createServer({
          typeDefs,
          resolvers,
          tracing: true,
        });

        const apolloFetch = createApolloFetch({ uri });
        const result = await apolloFetch({
          query: `{ books { title author } }`,
        });
        expect(result.data).to.deep.equal({ books });
        expect(result.extensions).to.exist;
        expect(result.extensions.tracing).to.exist;
      });

      it('applies tracing extension with cache control enabled', async () => {
        const { url: uri } = await createServer({
          typeDefs,
          resolvers,
          tracing: true,
          cacheControl: true,
        });

        const apolloFetch = createApolloFetch({ uri });
        const result = await apolloFetch({
          query: `{ books { title author } }`,
        });
        expect(result.data).to.deep.equal({ books });
        expect(result.extensions).to.exist;
        expect(result.extensions.tracing).to.exist;
      });

      xit('applies tracing extension with engine enabled', async () => {
        const { url: uri } = await createServer({
          typeDefs,
          resolvers,
          tracing: true,
          engine: {
            apiKey: 'fake',
            maxAttempts: 0,
            endpointUrl: 'l',
            reportErrorFunction: () => {},
          },
        });

        const apolloFetch = createApolloFetch({ uri });
        const result = await apolloFetch({
          query: `{ books { title author } }`,
        });
        expect(result.data).to.deep.equal({ books });
        expect(result.extensions).to.exist;
        expect(result.extensions.tracing).to.exist;
      });
    });
  });
});
