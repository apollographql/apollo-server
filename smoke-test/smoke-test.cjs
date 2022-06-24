const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const fetch = require('make-fetch-happen');
const assert = require('assert');

async function validateAllImports() {
  require('@apollo/server');
  require('@apollo/server/plugin/cacheControl');
  require('@apollo/server/plugin/disabled');
  require('@apollo/server/plugin/drainHttpServer');
  require('@apollo/server/plugin/inlineTrace');
  require('@apollo/server/plugin/landingPage/default');
  require('@apollo/server/plugin/landingPage/graphqlPlayground');
  require('@apollo/server/plugin/schemaReporting');
  require('@apollo/server/plugin/usageReporting');
  require('@apollo/server/standalone');
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
    console.log('CJS smoke test passed!');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
