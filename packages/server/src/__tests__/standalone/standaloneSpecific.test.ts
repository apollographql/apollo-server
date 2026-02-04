import { describe, expect, it } from '@jest/globals';
import fetch from 'node-fetch';
import { encode } from 'iconv-lite';
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

describe('Request body charset handling', () => {
  it.each<{ encoding: string; charset: string | null }>([
    { encoding: 'utf-8', charset: null },
    { encoding: 'utf-8', charset: 'UTF-8' },
    { encoding: 'utf-8', charset: 'utf-8' },
    { encoding: 'utf-16', charset: 'utf-16' },
    { encoding: 'utf-16le', charset: 'utf-16le' },
    { encoding: 'utf-16be', charset: 'utf-16be' },
  ])(
    'allows $encoding in request body (passed in header: $charset)',
    async ({ encoding, charset }) => {
      const server = new ApolloServer({
        typeDefs: `type Query { hello(name: String!): String! }`,
        resolvers: {
          Query: {
            hello: (_, { name }) => `hello ${name}!`,
          },
        },
      });
      const { url } = await startStandaloneServer(server, {
        listen: { port: 0 },
      });
      const result = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': `application/json${charset ? `;charset=${charset}` : ''}`,
        },
        body: encode(
          JSON.stringify({
            query: `query($name: String!){hello(name: $name)}`,
            variables: { name: '👻' },
          }),
          encoding,
        ),
      });

      if (result.ok === false) {
        console.error(await result.text());
      }
      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
      expect(await result.json()).toEqual({
        data: { hello: 'hello 👻!' },
      });

      await server.stop();
    },
  );

  it.each<{
    encoding: string;
    charset: string | null;
    status: number;
    expectedError: RegExp;
  }>([
    // exotic encodings
    {
      encoding: 'win1251',
      charset: 'win1251',
      status: 415,
      expectedError:
        /UnsupportedMediaTypeError: unsupported charset &quot;WIN1251&quot;/,
    },
    {
      encoding: 'iso-8859-1',
      charset: 'iso-8859-1',
      status: 415,
      expectedError:
        /UnsupportedMediaTypeError: unsupported charset &quot;ISO-8859-1&quot;/,
    },
    {
      encoding: 'windows936',
      charset: 'windows936',
      status: 415,
      expectedError:
        /UnsupportedMediaTypeError: unsupported charset &quot;WINDOWS936&quot;/,
    },
    {
      encoding: 'utf-7',
      charset: 'utf-7',
      status: 415,
      expectedError:
        /UnsupportedMediaTypeError: unsupported charset &quot;UTF-7&quot;/,
    },
    {
      encoding: 'utf-7-imap',
      charset: 'utf-7-imap',
      status: 415,
      expectedError:
        /UnsupportedMediaTypeError: unsupported charset &quot;UTF-7-IMAP&quot;/,
    },
    // sending one encoding but declaring another
    {
      encoding: 'utf-7',
      charset: 'utf-8',
      status: 400,
      expectedError:
        /SyntaxError: Unexpected token .* (in JSON at position|is not valid JSON)/,
    },
  ])(
    'fails with $status for $encoding in request body (passed in header: $charset)',
    async ({ encoding, charset, expectedError, status }) => {
      const server = new ApolloServer({
        typeDefs: `type Query { hello(name: String!): String! }`,
        resolvers: {
          Query: {
            hello: (_, { name }) => `hello ${name}!`,
          },
        },
      });
      const { url } = await startStandaloneServer(server, {
        listen: { port: 0 },
      });
      const result = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': `application/json${charset ? `;charset=${charset}` : ''}`,
        },
        body: encode(
          JSON.stringify({
            query: `query($name: String!){hello(name: $name)}`,
            variables: { name: '👻' },
          }),
          encoding,
        ),
      });

      expect(result.ok).toBe(false);
      expect(result.status).toBe(status);
      expect(await result.text()).toMatch(expectedError);

      await server.stop();
    },
  );
});
