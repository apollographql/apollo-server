import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import fetch from 'make-fetch-happen';
import assert from 'assert';
import { version as graphqlVersion } from 'graphql';

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
  ${
    process.env.INCREMENTAL_DELIVERY_TESTS_ENABLED
      ? 'directive @defer(if: Boolean! = true, label: String) on FRAGMENT_SPREAD | INLINE_FRAGMENT'
      : ''
  }
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
  const specVersion =
    graphqlVersion === '17.0.0-alpha.9'
      ? 'incrementalDeliverySpec=3283f8a'
      : 'deferSpec=20220824';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: `multipart/mixed; ${specVersion}, application/json`,
    },
    body: JSON.stringify({ query: '{h1: hello ...@defer{ h2: hello }}' }),
  });

  assert.strictEqual(
    response.headers.get('content-type'),
    `multipart/mixed; boundary="-"; ${specVersion}`,
  );

  const body = await response.text();

  if (graphqlVersion === '17.0.0-alpha.2') {
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
  } else {
    assert.strictEqual(
      body,
      '\r\n' +
        '---\r\n' +
        'content-type: application/json; charset=utf-8\r\n' +
        '\r\n' +
        '{"hasNext":true,"data":{"h1":"world"},"pending":[{"id":"0","path":[]}]}\r\n' +
        '---\r\n' +
        'content-type: application/json; charset=utf-8\r\n' +
        '\r\n' +
        '{"hasNext":false,"incremental":[{"id":"0","data":{"h2":"world"}}],"completed":[{"id":"0"}]}\r\n' +
        '-----\r\n',
    );
  }
}
await s.stop();

console.log('ESM smoke test passed!');
