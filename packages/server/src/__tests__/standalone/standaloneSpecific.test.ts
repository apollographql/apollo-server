import { httpServer as getHttpServer } from '../../standalone';
import { ApolloServer } from '../../ApolloServer';

describe('TContext inference', () => {
  it('correctly infers BaseContext when no `context` function is provided', async () => {
    const server = new ApolloServer({
      typeDefs: `type Query { foo: String}`,
    });
    await getHttpServer(server).listen();
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

    await getHttpServer(server, {
      async context() {
        return { foo: 'bar' };
      },
    }).listen();
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
    await getHttpServer(server).listen();
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
    await getHttpServer(server, {
      async context() {
        return { notFoo: 'oops' };
      },
    }).listen();
  });
});
