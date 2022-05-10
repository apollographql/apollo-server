import { httpServer as getHttpServer } from '../../standalone';
import { ApolloServer } from '../../ApolloServer';

describe('Typings: TContext inference', () => {
  it('correctly infers BaseContext when no `context` function is provided', async () => {
    const server = new ApolloServer({
      typeDefs: `type Query { foo: String}`,
    });

    // HTTPApolloServer<BaseContext>
    getHttpServer(server);
  });

  // `context` function can provide a superset of the `TContext` inferred by or
  // provided to the ApolloServer instance
  it('infers BaseContext when no TContext is provided to ApolloServer, even if a `context` function is provided', async () => {
    const server = new ApolloServer({
      typeDefs: `type Query { foo: String}`,
    });

    // HTTPApolloServer<BaseContext>
    getHttpServer(server, {
      async context() {
        return { foo: 'bar' };
      },
    });
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
    getHttpServer(server, {
      async context() {
        return { foo: 'bar' };
      },
    });
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
    getHttpServer(server);
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
    getHttpServer(server, {
      async context() {
        return { notFoo: 'oops' };
      },
    });
  });
});
