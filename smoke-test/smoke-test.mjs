import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import fetch from 'make-fetch-happen';
import assert from 'assert';

// validate all deep imports
await import('@apollo/server');
await import('@apollo/server/plugin/cacheControl');
await import('@apollo/server/plugin/disabled');
await import('@apollo/server/plugin/drainHttpServer');
await import('@apollo/server/plugin/inlineTrace');
await import('@apollo/server/plugin/landingPage/default');
await import('@apollo/server/plugin/schemaReporting');
await import('@apollo/server/plugin/usageReporting');
await import('@apollo/server/standalone');

const s = new ApolloServer({
  typeDefs: `
  directive @defer(if: Boolean! = true, label: String) on FRAGMENT_SPREAD | INLINE_FRAGMENT
  type Query {hello:String}
`,
  resolvers: {
    Query: {
      hello() {
        return 'world';
      },
    },
  },
});
const { url } = await startStandaloneServer(s, { listen: { port: 0 } });

{
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: '{hello}' }),
  });
  const body = await response.json();

  assert.strictEqual(body.data.hello, 'world');
}

if (process.env.INCREMENTAL_DELIVERY_TESTS_ENABLED) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'multipart/mixed; deferSpec=20220824, application/json',
    },
    body: JSON.stringify({ query: '{h1: hello ...@defer{ h2: hello }}' }),
  });

  assert.strictEqual(
    response.headers.get('content-type'),
    'multipart/mixed; boundary="-"; deferSpec=20220824',
  );

  const body = await response.text();

  assert.strictEqual(
    body,
    '\r\n' +
      '---\r\n' +
      'content-type: application/json; charset=utf-8\r\n' +
      '\r\n' +
      '{"hasNext":true,"data":{"h1":"world"}}\r\n' +
      '---\r\n' +
      'content-type: application/json; charset=utf-8\r\n' +
      '\r\n' +
      '{"hasNext":false,"incremental":[{"path":[],"data":{"h2":"world"}}]}\r\n' +
      '-----\r\n',
  );
}
await s.stop();

console.log('ESM smoke test passed!');
