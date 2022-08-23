import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import fetch from 'make-fetch-happen';
import assert from 'assert';

async function validateAllImports() {
  await import('@apollo/server');
  await import('@apollo/server/plugin/cacheControl');
  await import('@apollo/server/plugin/disabled');
  await import('@apollo/server/plugin/drainHttpServer');
  await import('@apollo/server/plugin/inlineTrace');
  await import('@apollo/server/plugin/landingPage/default');
  await import('@apollo/server/plugin/schemaReporting');
  await import('@apollo/server/plugin/usageReporting');
  await import('@apollo/server/standalone');
}

async function smokeTest() {
  await validateAllImports();

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
}

smokeTest()
  .then(() => {
    console.log('TS-NODENEXT smoke test passed!');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
