import { ApolloServer } from '../..';
import { startStandaloneServer } from '../../standalone';
import { describe, it, expect } from '@jest/globals';

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

describe('Configuration', () => {
  it('allows > 100kb bodies to be sent', async () => {
    const server = new ApolloServer({
      typeDefs: `type Query { foo: String }`,
      validationRules: [], // validations take way too long on large bodies
    });

    const { url } = await startStandaloneServer(server, {
      listen: { port: 0 },
    });

    const excessivelyLargeBody = JSON.stringify({
      query: `{foo}`,
      variables: Object.fromEntries([...Array(7960)].map((_, i) => [i, 'foo'])),
    });

    expect(
      Buffer.byteLength(excessivelyLargeBody, 'utf8'),
    ).toMatchInlineSnapshot(`102401`); // 100kib limit = 102400 bytes

    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: excessivelyLargeBody,
    });
    const text = await result.text();

    expect(text).toMatch('PayloadTooLargeError');

    await server.stop();
  });
});
