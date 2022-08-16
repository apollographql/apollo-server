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
  typeDefs: 'type Query {hello:String}',
  resolvers: {
    Query: {
      hello() {
        return 'world';
      },
    },
  },
});
const { url } = await startStandaloneServer(s, { listen: { port: 0 } });

const response = await fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ query: '{hello}' }),
});
const body = await response.json();

assert.strictEqual(body.data.hello, 'world');

await s.stop();

console.log('ESM smoke test passed!');
