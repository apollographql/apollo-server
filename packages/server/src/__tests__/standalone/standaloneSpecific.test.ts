import { httpServer as getHttpServer } from '../../standalone';
import { ApolloServer } from '../../ApolloServer';

describe('TContext inference', () => {
  it('correctly infers BaseContext when no `context` function is provided', async () => {
    const server = new ApolloServer({
      typeDefs: `type Query { foo: String}`,
    });
    const httpServer = getHttpServer(server);
    await httpServer.listen({ port: 0 });
    await server.stop();
  });

  it('correctly infers `MyContext` when `context` function is provided', async () => {
    interface MyContext {
      foo: string;
    }

    const server = new ApolloServer<MyContext>({
      typeDefs: `type Query { foo: String}`,
      resolvers: {
        Query: {
          foo: (_, __, context) => {
            return context;
          },
        },
      },
    });

    const httpServer = getHttpServer(server, {
      async context() {
        return { foo: 'bar' };
      },
    });
    await httpServer.listen({ port: 0 });
  });

  it('errors when `TContext` is provided without a `context` function', async () => {
    interface MyContext {
      foo: string;
    }

    const server = new ApolloServer<MyContext>({
      typeDefs: `type Query { foo: String}`,
      resolvers: {
        Query: {
          foo: (_, __, context) => {
            return context;
          },
        },
      },
    });

    // @ts-expect-error
    const httpServer = getHttpServer(server);
    await httpServer.listen({ port: 0 });
    await server.stop();
  });

  it('errors when `TContext` is provided without a compatible `context` function', async () => {
    interface MyContext {
      foo: string;
    }

    const server = new ApolloServer<MyContext>({
      typeDefs: `type Query { foo: String}`,
      resolvers: {
        Query: {
          foo: (_, __, context) => {
            return context;
          },
        },
      },
    });

    // @ts-expect-error
    const httpServer = getHttpServer(server, {
      async context() {
        return { notFoo: 'oops' };
      },
    });

    await httpServer.listen({ port: 0 });
    await server.stop();
  });
});
