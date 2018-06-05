/* tslint:disable:no-unused-expression */
import { expect } from 'chai';
import { stub } from 'sinon';
import * as http from 'http';
import * as net from 'net';
import 'mocha';

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLError,
  ValidationContext,
  FieldDefinitionNode,
} from 'graphql';

import { PubSub } from 'graphql-subscriptions';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import * as WebSocket from 'ws';
Object.assign(global, {
  WebSocket: WebSocket,
});

import { createApolloFetch } from 'apollo-fetch';
import { ApolloServerBase } from './ApolloServer';
import { AuthenticationError } from './errors';
import { gql } from './index';
import { convertNodeHttpToRequest } from './nodeHttpToRequest';
import { runHttpQuery } from './runHttpQuery';

const INTROSPECTION_QUERY = `
  {
    __schema {
      directives {
        name
      }
    }
  }
`;

const TEST_STRING_QUERY = `
  {
    testString
  }
`;

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  fields: {
    testString: {
      type: GraphQLString,
      resolve() {
        return 'test string';
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: queryType,
});

function createHttpServer(server) {
  return http.createServer(async (req, res) => {
    let body: any = [];
    req
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        // At this point, we have the headers, method, url and body, and can now
        // do whatever we need to in order to respond to this request.

        runHttpQuery([req, res], {
          method: req.method,
          options: server.graphQLServerOptionsForRequest(req as any),
          query: JSON.parse(body),
          request: convertNodeHttpToRequest(req),
        })
          .then(gqlResponse => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader(
              'Content-Length',
              Buffer.byteLength(gqlResponse, 'utf8').toString(),
            );
            res.write(gqlResponse);
            res.end();
          })
          .catch(error => {
            res.write(error.message);
            res.end();
          });
      });
  });
}

describe('ApolloServerBase', () => {
  describe('constructor', () => {
    describe('validation rules', () => {
      it('accepts additional rules', async () => {
        const NoTestString = (context: ValidationContext) => ({
          Field(node: FieldDefinitionNode) {
            if (node.name.value === 'testString') {
              context.reportError(
                new GraphQLError('Not allowed to use', [node]),
              );
            }
          },
        });

        const server = new ApolloServerBase({
          schema,
          validationRules: [NoTestString],
          introspection: false,
        });
        const httpServer = createHttpServer(server);

        server.use({
          getHttp: () => httpServer,
          path: '/graphql',
        });
        const { url: uri } = await server.listen();
        const apolloFetch = createApolloFetch({ uri });

        const introspectionResult = await apolloFetch({
          query: INTROSPECTION_QUERY,
        });
        expect(introspectionResult.data, 'data should not exist').not.to.exist;
        expect(introspectionResult.errors, 'errors should exist').to.exist;

        const result = await apolloFetch({ query: TEST_STRING_QUERY });
        expect(result.data, 'data should not exist').not.to.exist;
        expect(result.errors, 'errors should exist').to.exist;

        await server.stop();
      });

      it('allows introspection by default', async () => {
        const nodeEnv = process.env.NODE_ENV;
        delete process.env.NODE_ENV;

        const server = new ApolloServerBase({
          schema,
        });
        const httpServer = createHttpServer(server);

        server.use({
          getHttp: () => httpServer,
          path: '/graphql',
        });
        const { url: uri } = await server.listen();
        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: INTROSPECTION_QUERY });
        expect(result.data, 'data should not exist').to.exist;
        expect(result.errors, 'errors should exist').not.to.exist;

        process.env.NODE_ENV = nodeEnv;
        await server.stop();
      });

      it('prevents introspection by default during production', async () => {
        const nodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const server = new ApolloServerBase({
          schema,
        });
        const httpServer = createHttpServer(server);

        server.use({
          getHttp: () => httpServer,
          path: '/graphql',
        });
        const { url: uri } = await server.listen();
        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: INTROSPECTION_QUERY });
        expect(result.data, 'data should not exist').not.to.exist;
        expect(result.errors, 'errors should exist').to.exist;
        expect(result.errors.length).to.equal(1);
        expect(result.errors[0].extensions.code).to.equal(
          'GRAPHQL_VALIDATION_FAILED',
        );

        process.env.NODE_ENV = nodeEnv;
        await server.stop();
      });

      it('allows introspection to be enabled explicitly', async () => {
        const nodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const server = new ApolloServerBase({
          schema,
          introspection: true,
        });
        const httpServer = createHttpServer(server);

        server.use({
          getHttp: () => httpServer,
          path: '/graphql',
        });
        const { url: uri } = await server.listen();
        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: INTROSPECTION_QUERY });
        expect(result.data, 'data should not exist').to.exist;
        expect(result.errors, 'errors should exist').not.to.exist;

        process.env.NODE_ENV = nodeEnv;
        await server.stop();
      });
    });

    describe('schema creation', () => {
      it('accepts typeDefs and resolvers', async () => {
        const typeDefs = gql`
          type Query {
            hello: String
          }
        `;
        const resolvers = { Query: { hello: () => 'hi' } };
        const server = new ApolloServerBase({
          typeDefs,
          resolvers,
        });
        const httpServer = createHttpServer(server);

        server.use({
          getHttp: () => httpServer,
          path: '/',
        });

        const { url: uri } = await server.listen();
        const apolloFetch = createApolloFetch({ uri });
        const result = await apolloFetch({ query: '{hello}' });

        expect(result.data).to.deep.equal({ hello: 'hi' });
        expect(result.errors, 'errors should exist').not.to.exist;
        await server.stop();
      });
      it('throws if typeDefs are a string', async () => {
        const typeDefs: any = `
          type Query {
            hello: String
          }
        `;
        const resolvers = { Query: { hello: () => 'hi' } };

        expect(
          () =>
            new ApolloServerBase({
              typeDefs,
              resolvers,
            }),
        ).to.throw(/apollo-server/);
      });
      it('uses schema over resolvers + typeDefs', async () => {
        const typeDefs = gql`
          type Query {
            hello: String
          }
        `;
        const resolvers = { Query: { hello: () => 'hi' } };
        const server = new ApolloServerBase({
          typeDefs,
          resolvers,
          schema,
        });
        const httpServer = createHttpServer(server);

        server.use({
          getHttp: () => httpServer,
          path: '/',
        });

        const { url: uri } = await server.listen();
        const apolloFetch = createApolloFetch({ uri });
        const typeDefResult = await apolloFetch({ query: '{hello}' });

        expect(typeDefResult.data, 'data should not exist').not.to.exist;
        expect(typeDefResult.errors, 'errors should exist').to.exist;

        const result = await apolloFetch({ query: '{testString}' });
        expect(result.data).to.deep.equal({ testString: 'test string' });
        expect(result.errors, 'errors should exist').not.to.exist;
        await server.stop();
      });
      it('allows mocks as boolean', async () => {
        const typeDefs = gql`
          type Query {
            hello: String
          }
        `;
        const server = new ApolloServerBase({
          typeDefs,
          mocks: true,
        });
        const httpServer = createHttpServer(server);

        server.use({
          getHttp: () => httpServer,
          path: '/',
        });

        const { url: uri } = await server.listen();
        const apolloFetch = createApolloFetch({ uri });
        const result = await apolloFetch({ query: '{hello}' });
        expect(result.data).to.deep.equal({ hello: 'Hello World' });
        expect(result.errors, 'errors should exist').not.to.exist;
        await server.stop();
      });

      it('allows mocks as an object', async () => {
        const typeDefs = gql`
          type Query {
            hello: String
          }
        `;
        const server = new ApolloServerBase({
          typeDefs,
          mocks: { String: () => 'mock city' },
        });
        const httpServer = createHttpServer(server);

        server.use({
          getHttp: () => httpServer,
          path: '/',
        });

        const { url: uri } = await server.listen();
        const apolloFetch = createApolloFetch({ uri });
        const result = await apolloFetch({ query: '{hello}' });

        expect(result.data).to.deep.equal({ hello: 'mock city' });
        expect(result.errors, 'errors should exist').not.to.exist;
        await server.stop();
      });
    });
  });

  describe('lifecycle', () => {
    it('defers context eval with thunk until after options creation', async () => {
      const uniqueContext = { key: 'major' };
      const typeDefs = gql`
        type Query {
          hello: String
        }
      `;
      const resolvers = {
        Query: {
          hello: (_parent, _args, context) => {
            expect(context).to.equal(Promise.resolve(uniqueContext));
            return 'hi';
          },
        },
      };
      const spy = stub().returns({});
      const server = new ApolloServerBase({
        typeDefs,
        resolvers,
        context: spy,
      });
      const httpServer = createHttpServer(server);
      server.use({
        getHttp: () => httpServer,
        path: '/',
      });

      const { url: uri } = await server.listen();
      const apolloFetch = createApolloFetch({ uri });

      expect(spy.notCalled).true;

      await apolloFetch({ query: '{hello}' });
      expect(spy.calledOnce).true;
      await apolloFetch({ query: '{hello}' });
      expect(spy.calledTwice).true;
      await server.stop();
    });

    it('allows context to be async function', async () => {
      const uniqueContext = { key: 'major' };
      const spy = stub().returns('hi');
      const typeDefs = gql`
        type Query {
          hello: String
        }
      `;
      const resolvers = {
        Query: {
          hello: (_parent, _args, context) => {
            expect(context).to.equal(uniqueContext);
            return spy();
          },
        },
      };
      const server = new ApolloServerBase({
        typeDefs,
        resolvers,
        context: async () => uniqueContext,
      });
      const httpServer = createHttpServer(server);
      server.use({
        getHttp: () => httpServer,
        path: '/',
      });

      const { url: uri } = await server.listen();
      const apolloFetch = createApolloFetch({ uri });

      expect(spy.notCalled).true;
      await apolloFetch({ query: '{hello}' });
      expect(spy.calledOnce).true;
      await server.stop();
    });

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
      const server = new ApolloServerBase({
        typeDefs,
        resolvers,
        context: () => {
          throw new AuthenticationError('valid result');
        },
      });
      const httpServer = createHttpServer(server);
      server.use({
        getHttp: () => httpServer,
        path: '/',
      });

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
      await server.stop();
    });

    it('propogates error codes in production', async () => {
      const nodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const server = new ApolloServerBase({
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
      const httpServer = createHttpServer(server);

      server.use({
        getHttp: () => httpServer,
        path: '/graphql',
      });
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
      await server.stop();
    });

    it('propogates error codes with null response in production', async () => {
      const nodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const server = new ApolloServerBase({
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
      const httpServer = createHttpServer(server);

      server.use({
        getHttp: () => httpServer,
        path: '/graphql',
      });
      const { url: uri } = await server.listen();
      const apolloFetch = createApolloFetch({ uri });

      const result = await apolloFetch({ query: `{error}` });
      expect(result.data).null;

      expect(result.errors, 'errors should exist').to.exist;
      expect(result.errors.length).to.equal(1);
      expect(result.errors[0].extensions.code).to.equal('UNAUTHENTICATED');
      expect(result.errors[0].extensions.exception).not.to.exist;

      process.env.NODE_ENV = nodeEnv;
      await server.stop();
    });
  });

  describe('engine', () => {
    it('creates ApolloEngine instance when api key is present', async () => {
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
      const server = new ApolloServerBase({
        typeDefs,
        resolvers,
      });
      const httpServer = createHttpServer(server);
      server.use({
        getHttp: () => httpServer,
        path: '/',
      });

      const { url: engineUri, port: enginePort } = await server.listen({
        engineProxy: {
          apiKey: 'service:apollographql-6872:D6HRzC5ykWElYO3A2od1uA',
          logging: {
            level: 'ERROR',
          },
        },
        http: {
          port: 4242,
        },
      });
      expect(enginePort).to.equal(4242);

      //Check engine responding
      const engineApolloFetch = createApolloFetch({ uri: engineUri });
      const engineResult = await engineApolloFetch({ query: '{hello}' });
      expect(engineResult.data).to.deep.equal({ hello: 'hi' });
      expect(engineResult.errors, 'errors should not exist').not.to.exist;
      expect(engineResult.extensions, 'extensions should exist').not.to.exist;

      //only windows returns a string https://github.com/nodejs/node/issues/12895
      const { address, port } = httpServer.address() as net.AddressInfo;
      expect(enginePort).not.to.equal(port);
      const uri = `http://${address}:${port}/`;

      //Check origin server responding and includes extensions
      const apolloFetch = createApolloFetch({ uri });
      const result = await apolloFetch({ query: '{hello}' });
      expect(result.data).to.deep.equal({ hello: 'hi' });
      expect(result.errors, 'errors should not exist').not.to.exist;
      expect(result.extensions, 'extensions should exist').to.exist;

      await server.stop();

      expect(httpServer.listening).false;
    });
  });

  describe('subscriptions', () => {
    const SOMETHING_CHANGED_TOPIC = 'something_changed';
    const pubsub = new PubSub();
    let server: ApolloServerBase;
    let subscription;

    function createEvent(num) {
      return setTimeout(
        () =>
          pubsub.publish(SOMETHING_CHANGED_TOPIC, {
            num,
          }),
        num + 10,
      );
    }

    afterEach(async () => {
      if (server) {
        try {
          await server.stop();
        } catch (e) {}
        server = null;
      }
      if (subscription) {
        try {
          await subscription.unsubscribe();
        } catch (e) {}
        subscription = null;
      }
    });

    it('enables subscriptions by default', done => {
      const typeDefs = gql`
        type Query {
          hi: String
        }

        type Subscription {
          num: Int
        }
      `;

      const query = `
        subscription {
          num
        }
      `;

      const resolvers = {
        Query: {
          hi: () => 'here to placate graphql-js',
        },
        Subscription: {
          num: {
            subscribe: () => {
              createEvent(1);
              createEvent(2);
              createEvent(3);
              return pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC);
            },
          },
        },
      };

      server = new ApolloServerBase({
        typeDefs,
        resolvers,
      });
      const httpServer = createHttpServer(server);

      server.use({
        getHttp: () => httpServer,
        path: '/graphql',
      });
      server.listen({}).then(({ port }) => {
        const client = new SubscriptionClient(
          `ws://localhost:${port}${server.subscriptionsPath}`,
          {},
          WebSocket,
        );

        const observable = client.request({ query });

        let i = 1;
        subscription = observable.subscribe({
          next: ({ data }) => {
            try {
              expect(data.num).to.equal(i);
              if (i === 3) {
                done();
              }
              i++;
            } catch (e) {
              done(e);
            }
          },
          error: done,
          complete: () => {
            done(new Error('should not complete'));
          },
        });
      });
    });
    it('disables subscritpions when option set to false', done => {
      const typeDefs = gql`
        type Query {
          "graphql-js forces there to be a query type"
          hi: String
        }

        type Subscription {
          num: Int
        }
      `;

      const query = `
        subscription {
          num
        }
      `;

      const resolvers = {
        Query: {
          hi: () => 'here to placate graphql-js',
        },
        Subscription: {
          num: {
            subscribe: () => {
              createEvent(1);
              return pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC);
            },
          },
        },
      };

      server = new ApolloServerBase({
        typeDefs,
        resolvers,
      });
      const httpServer = createHttpServer(server);

      server.use({
        getHttp: () => httpServer,
        path: '/graphql',
      });
      server
        .listen({
          subscriptions: false,
        })
        .then(({ port }) => {
          const client = new SubscriptionClient(
            `ws://localhost:${port}${server.subscriptionsPath}`,
            {},
            WebSocket,
          );

          const observable = client.request({ query });

          subscription = observable.subscribe({
            next: () => {
              done(new Error('should not call next'));
            },
            error: () => {
              done(new Error('should not notify of error'));
            },
            complete: () => {
              done(new Error('should not complete'));
            },
          });

          //Unfortunately the error connection is not propagated to the
          //observable. What should happen is we provide a default onError
          //function that notifies the returned observable and can cursomize
          //the behavior with an option in the client constructor. If you're
          //available to make a PR to the following please do!
          //https://github.com/apollographql/subscriptions-transport-ws/blob/master/src/client.ts
          client.onError((_: Error) => {
            done();
          });
        });
    });
    it('accepts subscriptions configuration', done => {
      const onConnect = stub().callsFake(connectionParams => ({
        ...connectionParams,
      }));
      const typeDefs = gql`
        type Query {
          hi: String
        }

        type Subscription {
          num: Int
        }
      `;

      const query = `
        subscription {
          num
        }
      `;

      const resolvers = {
        Query: {
          hi: () => 'here to placate graphql-js',
        },
        Subscription: {
          num: {
            subscribe: () => {
              createEvent(1);
              createEvent(2);
              createEvent(3);
              return pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC);
            },
          },
        },
      };

      server = new ApolloServerBase({
        typeDefs,
        resolvers,
      });
      const httpServer = createHttpServer(server);
      const path = '/sub';

      server.use({
        getHttp: () => httpServer,
        path: '/graphql',
      });
      server
        .listen({
          subscriptions: { onConnect, path },
        })
        .then(({ port }) => {
          expect(onConnect.notCalled).true;

          expect(server.subscriptionsPath).to.equal(path);
          const client = new SubscriptionClient(
            `ws://localhost:${port}${server.subscriptionsPath}`,
            {},
            WebSocket,
          );

          const observable = client.request({ query });

          let i = 1;
          subscription = observable.subscribe({
            next: ({ data }) => {
              try {
                expect(onConnect.calledOnce).true;
                expect(data.num).to.equal(i);
                if (i === 3) {
                  done();
                }
                i++;
              } catch (e) {
                done(e);
              }
            },
            error: done,
            complete: () => {
              done(new Error('should not complete'));
            },
          });
        })
        .catch(done);
    });
  });
});
