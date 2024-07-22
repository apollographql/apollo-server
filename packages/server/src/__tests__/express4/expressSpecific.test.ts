import express, { json } from 'express';
import request from 'supertest';
import compression, { filter as defaultFilter } from 'compression';
import { ApolloServer, BaseContext } from '../../index.js';
import { expressMiddleware } from '../../express4/index.js';
import { it, expect } from '@jest/globals';
import resolvable from '../../utils/resolvable.js';
import cors from 'cors';

it('gives helpful error if json middleware is not installed', async () => {
  const server = new ApolloServer({ typeDefs: 'type Query {f: ID}' });
  await server.start();
  const app = express();
  // Note lack of `json` here.
  app.use(expressMiddleware(server));

  await request(app)
    .post('/')
    .send({ query: '{hello}' })
    .expect(500, /forgot to set up the `json` middleware/);
  await server.stop();
});

it('not calling start causes a clear error', async () => {
  const server = new ApolloServer({ typeDefs: 'type Query {f: ID}' });
  expect(() => expressMiddleware(server)).toThrow(
    'You must `await server.start()`',
  );
});

it('context optional only if TContext=BaseContext', async () => {
  const baseContextServer = new ApolloServer<BaseContext>({
    typeDefs: 'type Query{x:ID}',
  });
  await baseContextServer.start();
  const differentContextServer = new ApolloServer<{ x: number }>({
    typeDefs: 'type Query{x:ID}',
  });
  await differentContextServer.start();

  // This is a typechecking test, so we don't actually do anything with these
  // middlewares.
  expressMiddleware(baseContextServer);
  expressMiddleware(baseContextServer, { context: async () => ({}) });
  expressMiddleware(differentContextServer, {
    context: async () => ({ x: 5 }),
  });
  // @ts-expect-error
  expressMiddleware(differentContextServer);
});

// This test validates that you can use incremental delivery with the
// `compression` package (which requires a hacky `res.flush()` call in the
// middleware).
it('incremental delivery works with compression', async () => {
  const gotFirstChunkBarrier = resolvable();
  const sendSecondChunkBarrier = resolvable();
  const app = express();
  const server = new ApolloServer({
    typeDefs: `#graphql
  directive @defer(if: Boolean! = true, label: String) on FRAGMENT_SPREAD | INLINE_FRAGMENT
  type Query {
    testString: String
    barrierString: String
  }
  `,
    __testing_incrementalExecutionResults: {
      initialResult: {
        hasNext: true,
        data: { testString: 'it works' },
      },
      subsequentResults: (async function* () {
        await sendSecondChunkBarrier;
        yield {
          hasNext: false,
          incremental: [{ path: [], data: { barrierString: 'we waited' } }],
        };
      })(),
    },
  });
  await server.start();
  app.use(
    // Teach `compression` to treat multipart/mixed as compressible.
    compression({
      filter: (req, res) =>
        defaultFilter(req, res) ||
        !!res
          .getHeader('content-type')
          ?.toString()
          .startsWith('multipart/mixed'),
    }),
    cors(),
    json(),
    expressMiddleware(server),
  );

  const resPromise = request(app)
    .post('/')
    .set('accept', 'multipart/mixed; deferSpec=20220824, application/json')
    .parse((res, fn) => {
      res.text = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        res.text += chunk;
        if (res.text.includes('it works') && res.text.endsWith('---\r\n')) {
          gotFirstChunkBarrier.resolve();
        }
      });
      res.on('end', fn);
    })
    .send({ query: '{ testString ... @defer { barrierString } }' })
    // believe it or not, superagent uses `.then` to decide to actually send the request
    .then((r) => r);

  // We ensure that the second chunk can't be sent until after we've
  // gotten back a chunk containing the value of testString.
  await gotFirstChunkBarrier;
  sendSecondChunkBarrier.resolve();

  const res = await resPromise;
  expect(res.status).toEqual(200);
  // Confirm that the response has actually been gzipped.
  expect(res.header['content-encoding']).toMatchInlineSnapshot(`"gzip"`);
  expect(res.header['content-type']).toMatchInlineSnapshot(
    `"multipart/mixed; boundary="-"; deferSpec=20220824"`,
  );
  expect(res.text).toMatchInlineSnapshot(`
    "
    ---
    content-type: application/json; charset=utf-8

    {"hasNext":true,"data":{"testString":"it works"}}
    ---
    content-type: application/json; charset=utf-8

    {"hasNext":false,"incremental":[{"path":[],"data":{"barrierString":"we waited"}}]}
    -----
    "
  `);

  await server.stop();
});

it('supporting doubly-encoded variables example from migration guide', async () => {
  const server = new ApolloServer({
    typeDefs: 'type Query {hello(s: String!): String!}',
    resolvers: {
      Query: {
        hello: (_root, { s }) => s,
      },
    },
  });
  await server.start();
  const app = express();

  app.use(json());

  // Test will fail if you remove this middleware.
  app.use((req, res, next) => {
    if (typeof req.body?.variables === 'string') {
      try {
        req.body.variables = JSON.parse(req.body.variables);
      } catch (e) {
        // https://github.com/graphql/graphql-over-http/blob/main/spec/GraphQLOverHTTP.md#json-parsing-failure
        res.status(400).send(e instanceof Error ? e.message : e);
      }
    }
    next();
  });

  app.use(expressMiddleware(server));

  await request(app)
    .post('/')
    .send({
      query: 'query Hello($s: String!){hello(s: $s)}',
      variables: { s: 'normally encoded' },
    })
    .expect(200, { data: { hello: 'normally encoded' } });

  await request(app)
    .post('/')
    .send({
      query: 'query Hello($s: String!){hello(s: $s)}',
      variables: JSON.stringify({ s: 'doubly-encoded' }),
    })
    .expect(200, { data: { hello: 'doubly-encoded' } });

  await request(app)
    .post('/')
    .send({
      query: 'query Hello($s: String!){hello(s: $s)}',
      variables: '{malformed JSON}',
    })
    .expect(400, /in JSON at position 1/);

  await server.stop();
});
