import { ApolloServer } from '../..';
import { startStandaloneServer } from '../../standalone';
import { describe, it } from '@jest/globals';

describe('Typings: TContext inference', () => {
  it('correctly infers BaseContext when no `context` function is provided', async () => {
    const server = new ApolloServer({
      typeDefs: `type Query { foo: String}`,
    });

    // HTTPApolloServer<BaseContext>
    await startStandaloneServer(server, { listen: { port: 0 } });
    await server.stop();
  });

  // `context` function can provide a superset of the `TContext` inferred by or
  // provided to the ApolloServer instance
  it('infers BaseContext when no TContext is provided to ApolloServer, even if a `context` function is provided', async () => {
    const server = new ApolloServer({
      typeDefs: `type Query { foo: String}`,
    });

    // HTTPApolloServer<BaseContext>
    await startStandaloneServer(server, {
      async context() {
        return { foo: 'bar' };
      },
      listen: { port: 0 },
    });
    await server.stop();
  });

  it('correctly infers `MyContext` when generic and `context` function are both provided', async () => {
    interface MyContext {
      foo: string;
    }

    const server = new ApolloServer<MyContext>({
      typeDefs: `type Query { foo: String}`,
      resolvers: {
        Query: {
          foo: (_, __, context) => {
            return context.foo;
          },
        },
      },
    });

    // HTTPApolloServer<MyContext>
    await startStandaloneServer(server, {
      async context() {
        return { foo: 'bar' };
      },
      listen: { port: 0 },
    });
    await server.stop();
  });

  it('errors when `MyContext` is provided without a `context` function', async () => {
    interface MyContext {
      foo: string;
    }

    const server = new ApolloServer<MyContext>({
      typeDefs: `type Query { foo: String}`,
      resolvers: {
        Query: {
          foo: (_, __, context) => {
            return context.foo;
          },
        },
      },
    });

    // @ts-expect-error
    await startStandaloneServer(server, { listen: { port: 0 } });
    await server.stop();
  });

  it('errors when `MyContext` is provided without a compatible `context` function', async () => {
    interface MyContext {
      foo: string;
    }

    const server = new ApolloServer<MyContext>({
      typeDefs: `type Query { foo: String}`,
      resolvers: {
        Query: {
          foo: (_, __, context) => {
            return context.foo;
          },
        },
      },
    });

    // @ts-expect-error
    await startStandaloneServer(server, {
      async context() {
        return { notFoo: 'oops' };
      },
      listen: { port: 0 },
    });
    await server.stop();
  });
});
