import { describe, expect, it } from '@jest/globals';
import fetch from 'node-fetch';
import { ApolloServer } from '../..';
import { startStandaloneServer } from '../../standalone';

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
  it('allows > 100KiB bodies to be sent (body-parser default)', async () => {
    const server = new ApolloServer({
      typeDefs: `type Query { hello: String }`,
      resolvers: {
        Query: {
          hello: () => 'hello world!',
        },
      },
    });

    const { url } = await startStandaloneServer(server, {
      listen: { port: 0 },
    });

    const excessivelyLargeBody = JSON.stringify({
      query: `{hello}`,
      variables: { foo: 'a'.repeat(102400) },
    });

    // 100kib limit = 102400 bytes
    expect(Buffer.byteLength(excessivelyLargeBody)).toBeGreaterThan(102400);

    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: excessivelyLargeBody,
    });
    const { data } = await result.json();

    expect(data.hello).toEqual('hello world!');

    await server.stop();
  });
});
